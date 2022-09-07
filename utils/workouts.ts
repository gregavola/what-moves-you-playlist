import * as mongoDB from "mongodb";

export async function getWorkouts(accountId: string, db: mongoDB.Db) {
  const workoutCollections = await db.collection("temp-workouts");

  const response = await workoutCollections.findOne({ accountId });

  return response;
}

export async function storeWorkouts(
  accountId: string,
  workouts: any,
  db: mongoDB.Db
) {
  const workoutCollections = await db.collection("temp-workouts");

  const userQuery = { accountId };
  const userUpdateQuery = {
    $setOnInsert: {
      createdAt: new Date(),
    },
    $set: {
      ...workouts,
      accountId,
      updatedAt: new Date(),
    },
  };

  const options = { upsert: true };
  const response = await workoutCollections.updateOne(
    userQuery,
    userUpdateQuery,
    options
  );

  return response;
}

export async function getWorkoutClass(classId: string, db: mongoDB.Db) {
  const workoutCollections = await db.collection("peloton-classes");

  const response = await workoutCollections.findOne({ classId });

  return response;
}

export async function storeWorkoutClasses(
  classId: string,
  workoutClasses: any,
  db: mongoDB.Db
) {
  const workoutCollections = await db.collection("peloton-classes");

  const userQuery = { classId };
  const userUpdateQuery = {
    $setOnInsert: {
      createdAt: new Date(),
    },
    $set: {
      classId,
      ...workoutClasses,
      updatedAt: new Date(),
    },
  };

  const options = { upsert: true };
  const response = await workoutCollections.updateOne(
    userQuery,
    userUpdateQuery,
    options
  );

  return response;
}
