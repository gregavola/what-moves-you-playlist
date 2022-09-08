import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getAuthUser } from "../../../../utils/getUserAuth";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { updateSpotifyPlaylistId } from "../../../../utils/crudUser";
import fs from "fs";

const base64Encode = (file: any) => {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString("base64");
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  try {
    if (!session) {
      return res.status(401).json({ error: "Not Logged In" });
    }

    const accountId = session.userId as string;
    const trackIds = req.body.trackIds;

    if (!trackIds) {
      return res.status(500).json({ error: "Missing Track Ids" });
    }

    const userInfo = await getAuthUser(accountId);

    if (!userInfo) {
      return res.status(401).json({ error: `Invalid User ${accountId}` });
    }

    const spotify = new SpotifyWebApi({
      accessToken: userInfo.accessToken,
    });

    let playlistId = userInfo.spotifyPlaylistId;

    if (playlistId) {
      try {
        const response = await spotify.playlists.getPlaylist(playlistId);
        playlistId = response.id;
      } catch (err) {
        console.error(err);
        if (err.message === "Request failed with status code 404") {
          playlistId = null;
        }
      }
    }

    if (!playlistId) {
      const response = await spotify.playlists.createPlaylist(
        accountId,
        "What Drives You Playlist",
        { public: false, collaborative: false }
      );

      playlistId = response.id;

      await updateSpotifyPlaylistId({
        accountId,
        spotifyPlaylistId: response.id,
      });
    }

    const responseAdd = await spotify.playlists.replacePlaylistItems(
      playlistId,
      trackIds
    );

    // const imageArtwork = "../../public/logo.png";

    // await spotify.playlists.uploadPlaylistCover(
    //   playlistId,
    //   base64Encode(imageArtwork)
    // );

    return res.json({ status: "OK", response: responseAdd });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Something unexpected happened." });
  }
}
