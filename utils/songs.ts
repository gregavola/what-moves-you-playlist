import * as mongoDB from 'mongodb';

export async function getSong(songId: string, db: mongoDB.Db) {
  const workoutCollections = await db.collection('spotify-songs');

  const response = await workoutCollections.findOne({ songId });

  return response;
}

export async function storeSong(songId: string, song: any, db: mongoDB.Db) {
  const workoutCollections = await db.collection('spotify-songs');

  const userQuery = { songId };
  const userUpdateQuery = {
    $setOnInsert: {
      createdAt: new Date(),
    },
    $set: {
      ...song,
      songId,
      updatedAt: new Date(),
    },
  };

  const options = { upsert: true };
  const response = await workoutCollections.updateOne(
    userQuery,
    userUpdateQuery,
    options,
  );

  return response;
}
