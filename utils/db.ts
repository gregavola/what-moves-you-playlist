import * as mongoDB from "mongodb";

let client: mongoDB.MongoClient;

export async function disconnectDB() {
  try {
    if (client) {
      client.close();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export async function connectDB() {
  client = new mongoDB.MongoClient(process.env.MONGO_CONNECTION_URI || "");

  await client.connect();

  const db: mongoDB.Db = client.db(`output-playlist`);

  return db;
}
