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

export async function getValidWorkouts(workouts: any) {
  if (!workouts?.data) {
    return false;
  }

  const filteredWorkouts = workouts.data.filter((workout: any) => {
    // if it has a run or ride, it's greater than 5 min, isn't a "Just Run / Just Ride" and isn't a Scenic Ride (playlist changes)
    return (
      workout.ride &&
      (workout.name === "Cycling Workout" ||
        workout.name === "Running Workout") &&
      workout.ride?.duration > 600 &&
      workout.ride.id !== "00000000000000000000000000000000"
    );
  });

  return filteredWorkouts.length === 0 ? false : true;
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
