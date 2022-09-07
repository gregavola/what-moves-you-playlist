import { connectDB, disconnectDB } from './db';

export async function getAuthUser(accountId: string) {
  const db = await connectDB();
  const userCollection = await db.collection('users');

  const response = await userCollection.findOne({ accountId });

  await disconnectDB();

  return response;
}
