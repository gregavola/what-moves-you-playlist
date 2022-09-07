import { connectDB, disconnectDB } from './db';
import { User } from './types';

export async function addUser({
  accountId,
  name,
  avatar,
  email,
  accessToken,
  refreshToken,
  expiresIn,
}: User) {
  const db = await connectDB();

  const userCollection = await db.collection('users');

  const userQuery = { accountId };
  const userUpdateQuery = {
    $setOnInsert: {
      createdAt: new Date(),
      pelotonUserId: null,
      pelotonCookie: null,
      spotifyPlaylistId: null,
    },
    $set: {
      refreshToken,
      accessToken,
      expiresIn,
      name,
      email,
      updatedAt: new Date(),
      avatar,
    },
  };

  const options = { upsert: true };
  const response = await userCollection.updateOne(
    userQuery,
    userUpdateQuery,
    options,
  );

  await disconnectDB();

  return response;
}

export async function addPeloton({
  accountId,
  pelotonUserId,
  pelotonCookie,
}: User) {
  const db = await connectDB();

  const userCollection = await db.collection('users');

  const userQuery = { accountId };
  const userUpdateQuery = {
    $set: {
      pelotonCookie,
      pelotonUserId,
      updatedAt: new Date(),
    },
  };

  const options = { upsert: true };
  const response = await userCollection.updateOne(
    userQuery,
    userUpdateQuery,
    options,
  );

  await disconnectDB();

  return response;
}

export async function removePeloton({ accountId }: User) {
  const db = await connectDB();

  const userCollection = await db.collection('users');

  const userQuery = { accountId };
  const userUpdateQuery = {
    $set: {
      pelotonCookie: null,
      pelotonUserId: null,
      updatedAt: new Date(),
    },
  };

  const response = await userCollection.updateOne(userQuery, userUpdateQuery);

  await disconnectDB();

  return response;
}

export async function updateSpotifyPlaylistId({
  accountId,
  spotifyPlaylistId,
}: User) {
  const db = await connectDB();

  const userCollection = await db.collection('users');

  const userQuery = { accountId };
  const userUpdateQuery = {
    $set: {
      spotifyPlaylistId,
      updatedAt: new Date(),
    },
  };

  const response = await userCollection.updateOne(userQuery, userUpdateQuery);

  await disconnectDB();

  return response;
}

export async function updateSpotifyCredentials({
  accountId,
  expiresIn,
  accessToken,
}: User) {
  const db = await connectDB();

  const userCollection = await db.collection('users');

  const userQuery = { accountId };
  const userUpdateQuery = {
    $set: {
      expiresIn,
      accessToken,
      updatedAt: new Date(),
    },
  };

  const response = await userCollection.updateOne(userQuery, userUpdateQuery);

  await disconnectDB();

  return response;
}
