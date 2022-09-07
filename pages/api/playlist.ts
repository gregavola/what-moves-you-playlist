import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getAuthUser } from '../../utils/getUserAuth';
import { createPlaylist } from '../../utils/playlist';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });

  try {
    if (!session) {
      return res.status(401).json({ error: 'Not Logged In' });
    }

    const accountId = session.userId as string;
    const playlistId = req.query.playlistId as string;
    const songs = req.body.songs;

    if (!playlistId || !songs) {
      return res.status(422).json({ error: 'Missing Playlist ID or Songs' });
    }
    const userInfo = await getAuthUser(accountId);

    if (!userInfo) {
      return res.status(422).json({ error: 'Invalid User' });
    }

    const response = await createPlaylist(
      userInfo.accountId,
      playlistId,
      songs,
    );

    return res.json({ status: 'OK', response });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Something unexpected happened.' });
  }
}
