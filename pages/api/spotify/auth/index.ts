import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getAuthUser } from "../../../../utils/getUserAuth";
import { SpotifyWebApi } from "spotify-web-api-ts";
import axios from "axios";
import { updateSpotifyCredentials } from "../../../../utils/crudUser";

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

    const userInfo = await getAuthUser(accountId);

    if (!userInfo) {
      return res.status(401).json({ error: `Invalid User ${accountId}` });
    }

    if (!userInfo.accessToken || !userInfo.refreshToken) {
      return res.status(401).json({ error: `Invalid User ${accountId}` });
    }

    let spotify = new SpotifyWebApi({
      accessToken: userInfo.accessToken,
    });

    try {
      const response = await spotify.users.getMe();
      return res.json(response);
    } catch (err) {
      if (err.message === "Request failed with status code 401") {
        const params = new URLSearchParams();

        params.append("grant_type", "refresh_token");
        params.append("refresh_token", userInfo.refreshToken);

        const response = await axios({
          method: "post",
          url: `https://accounts.spotify.com/api/token`,
          data: params,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
        });

        await updateSpotifyCredentials({
          accountId,
          accessToken: response.data.access_token,
          expiresIn: response.data.expires_in,
        });

        spotify = new SpotifyWebApi({
          accessToken: response.data.access_token,
        });

        const meResponse = await spotify.users.getMe();
        return res.json({ stauts: "refresh", me: meResponse });
      }

      return res.status(422).json(err.message);
    }
  } catch (err) {
    return res.status(500).json({ error: "Something unexpected happened." });
  }
}
