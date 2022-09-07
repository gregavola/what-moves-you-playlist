import { connectDB, disconnectDB } from './db';
import { Song } from './types';

export async function getPlaylist(playlistId: string) {
  const db = await connectDB();
  const playlistCollection = await db.collection('pending-playlist');

  const response = await playlistCollection.findOne({ playlistId });

  await disconnectDB();

  return response;
}

export async function createPlaylist(
  userId: string,
  playlistId: string,
  songs: Song[],
) {
  const db = await connectDB();
  const playlistCollection = await db.collection('pending-playlist');

  const userQuery = { playlistId };
  const userUpdateQuery = {
    $setOnInsert: {
      createdAt: new Date(),
    },
    $set: {
      playlistId,
      userId,
      songs,
      updatedAt: new Date(),
    },
  };

  const options = { upsert: true };
  const response = await playlistCollection.updateOne(
    userQuery,
    userUpdateQuery,
    options,
  );

  await disconnectDB();

  return response;
}
