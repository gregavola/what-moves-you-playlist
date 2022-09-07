import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SpotifyWebApi } from 'spotify-web-api-ts';
import { getAuthUser } from '../../../../utils/getUserAuth';
import { getPlaylist } from '../../../../utils/playlist';
import { Artist } from '../../../../utils/types';
import { getSong, storeSong } from '../../../../utils/songs';
import { connectDB, disconnectDB } from '../../../../utils/db';

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

    if (!playlistId) {
      return res.status(404).json({ error: 'Missing Playlist ID' });
    }

    const db = await connectDB();

    // const pusher = new Pusher({
    //   appId: '1470677',
    //   key: '5ce1895723a9355bb626',
    //   secret: process.env.PUSHER_SECRET || '',
    //   cluster: 'us2',
    //   useTLS: true,
    // });

    const userInfo = await getAuthUser(accountId);

    const currentPlaylists = await getPlaylist(playlistId);

    if (!currentPlaylists) {
      return res
        .status(404)
        .json({ error: `Playlist ${playlistId} not found` });
    }

    if (!userInfo) {
      return res.status(401).json({ error: `Invalid User ${accountId}` });
    }

    const spotify = new SpotifyWebApi({
      accessToken: userInfo.accessToken,
    });

    const songsFound: Array<any> = [];
    // let index = 0;
    // const totalSongs = currentPlaylists.songs.length;

    for (const song of currentPlaylists.songs) {
      // index++;

      const storedSongs = await getSong(song.id, db);

      if (storedSongs) {
        songsFound.push({ cached: true, ...storedSongs });

        // await pusher.trigger(`playlist-creator-${playlistId}`, 'track-found', {
        //   song: storedSongs,
        //   percentage: parseFloat((index / totalSongs).toFixed(2)) * 100,
        // });
      } else {
        const artists = song.artists.map((item: Artist) => {
          return item.artist_name;
        });

        const searchTerm = `${artists.join(' ')} ${song.name}`;
        const results = await spotify.search.searchTracks(searchTerm, {
          limit: 1,
        });

        if (results.items.length !== 0) {
          const serializedResults = results.items.map(item => {
            return {
              id: item.id,
              uri: item.uri,
              artists: item.artists,
              name: item.name,
              album: {
                images: item.album.images,
                name: item.album.name,
              },
              popularity: item.popularity,
            };
          });

          await storeSong(song.id, serializedResults[0], db);

          songsFound.push(serializedResults[0]);

          // await pusher.trigger(
          //   `playlist-creator-${playlistId}`,
          //   'track-found',
          //   {
          //     song: serializedResults[0],
          //     percentage: parseFloat((index / totalSongs).toFixed(2)) * 100,
          //   },
          // );
        }
      }
    }

    await disconnectDB();

    return res.json(songsFound);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Something unexpected happened.' });
  }
}
