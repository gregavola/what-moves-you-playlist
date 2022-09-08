import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getAuthUser } from "../../../../utils/getUserAuth";
import { SpotifyWebApi } from "spotify-web-api-ts";
import { updateSpotifyPlaylistId } from "../../../../utils/crudUser";
import fs from "fs";
import path from "path";

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

        // if you are not following it, re-follow
        if (response.followers.total === 0) {
          await spotify.follow.followPlaylist(playlistId);
        }
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
        "What Moves You Playlist",
        { public: false }
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

    const jsonDirectory = path.join(process.cwd(), "public");

    const imageArtwork = `${jsonDirectory}/cover-image.jpg`;

    let imageResponse = null;
    try {
      imageResponse = await spotify.playlists.uploadPlaylistCover(
        playlistId,
        base64Encode(imageArtwork)
      );
    } catch (err) {
      console.error(err);
    }

    return res.json({
      status: "OK",
      response: responseAdd,
      imageResponse,
      image: imageArtwork,
      base64: base64Encode(imageArtwork),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: "Something unexpected happened." });
  }
}
