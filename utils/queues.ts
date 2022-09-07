import * as mongoDB from "mongodb";

export async function getCurrentQueue(accountId: string, db: mongoDB.Db) {
  const workoutCollections = await db.collection("temp-workout-status");
  const response = await workoutCollections.findOne({ accountId });
  return response;
}

export async function createQueue(
  accountId: string,
  queueId: string,
  messageId: string,
  db: mongoDB.Db
) {
  const workoutCollections = await db.collection("temp-workout-status");

  const response = await workoutCollections.insertOne({
    accountId,
    queueId,
    status: "INPROGRESS",
    messageId,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentWorkout: 0,
    totalWorkouts: 0,
    percentage: 0,
  });
  return response;
}

export async function updateMessageId(
  accountId: string,
  messageId: string,
  db: mongoDB.Db
) {
  const workoutCollections = await db.collection("temp-workout-status");

  const userQuery = { accountId };
  const userUpdateQuery = {
    $set: {
      messageId,
      updatedAt: new Date(),
    },
  };

  const response = await workoutCollections.updateOne(
    userQuery,
    userUpdateQuery
  );

  return response;
}

export async function clearQueue(accountId: string, db: mongoDB.Db) {
  const workoutCollections = await db.collection("temp-workout-status");

  const userQuery = { accountId };
  const userUpdateQuery = {
    $set: {
      status: "INPROGRESS",
      messageId: null,
      updatedAt: new Date(),
      currentWorkout: 0,
      totalWorkouts: 0,
      percentage: 0,
    },
  };

  const response = await workoutCollections.updateOne(
    userQuery,
    userUpdateQuery
  );

  return response;
}
