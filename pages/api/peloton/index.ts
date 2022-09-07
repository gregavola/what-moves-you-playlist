// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import pelotonInstance from '../../../utils/peloton';
import find from 'lodash.find';
import orderBy from 'lodash.orderby';
import moment from 'moment';
import { getSession } from 'next-auth/react';
import {
  getWorkoutClass,
  getWorkouts,
  storeWorkoutClasses,
  storeWorkouts,
} from '../../../utils/workouts';
import { connectDB, disconnectDB } from '../../../utils/db';

const maxItemInArray = (listOfItems: Array<any>, key: string) => {
  let maxValue = 0;
  for (const item of listOfItems) {
    if (item[key]) {
      if (item[key] > maxValue) {
        maxValue = item[key];
      }
    }
  }

  return maxValue;
};

const minItemInArray = (listOfItems: Array<any>, key: string) => {
  let minValue = null;
  for (const item of listOfItems) {
    if (item[key]) {
      if (!minValue) {
        minValue = item[key];
      } else {
        if (item[key] < minValue) {
          minValue = item[key];
        }
      }
    }
  }

  return minValue;
};

// eslint-disable-next-line consistent-return
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });

  try {
    if (!session) {
      return res.status(401).json({ error: 'Not Logged In' });
    }

    const db = await connectDB();

    const accountId = session.userId as string;

    const { userId, cookie, refresh } = req.body;

    if (!userId || !cookie) {
      return res
        .status(422)
        .json({ error: 'Missing User ID or Peloton Cookie' });
    }

    if (!refresh) {
      const storedWorkouts = await getWorkouts(accountId, db);

      if (storedWorkouts) {
        await disconnectDB();
        return res.status(200).json({ cached: true, ...storedWorkouts });
      }
    }

    const peloton = await pelotonInstance(cookie);

    const todayDate = moment(new Date()).utc().toISOString();
    const priorDate = moment(new Date())
      .utc()
      .subtract(45, 'days')
      .toISOString();

    const params = {
      userId,
      to: todayDate,
      from: priorDate,
      stats_from: priorDate,
      stats_to: todayDate,
      joins: 'ride',
    };

    const workouts = await peloton.workouts(params);

    if (!workouts.data) {
      return res.status(workouts.status || 500).json({
        status: workouts.status || 500,
        error: workouts.message || 'Unknown Error',
        response: workouts,
        params,
      });
    }

    if (workouts.data?.length === 0) {
      return res.status(200).json({ status: 'NO_DATA', workouts });
    }
    const workoutsWithOutput = [];
    const uniqueSongs = [];

    for (const workout of workouts.data) {
      // if it has a run or ride, it's greater than 5 min, isn't a "Just Run / Just Ride" and isn't a Scenic Ride (playlist changes)
      if (
        workout.ride &&
        (workout.name === 'Cycling Workout' ||
          workout.name === 'Running Workout') &&
        workout.ride?.duration > 600 &&
        workout.ride.id !== '00000000000000000000000000000000'
      ) {
        const classId = workout.ride.id;
        const rideId = workout.id;
        if (workout.total_work !== 0) {
          let rideDetails: any = null;

          rideDetails = await getWorkoutClass(classId, db);

          if (!rideDetails) {
            rideDetails = await peloton.rideDetails({
              rideId: classId,
            });

            await storeWorkoutClasses(classId, rideDetails, db);
          }

          const playlist = [];
          const songs = rideDetails.playlist?.songs;
          if (songs && songs.length !== 0) {
            let iterator = 0;
            for (const song of songs) {
              const startTime =
                song.start_time_offset === 60
                  ? 0
                  : song.start_time_offset - 100;
              let endTime = workout.ride.duration;
              let durationTime = endTime - startTime;

              iterator++;
              if (songs[iterator]) {
                endTime = songs[iterator].start_time_offset - 100;
                durationTime = endTime - startTime;
              }

              playlist.push({
                id: song.id,
                name: song.title,
                artists: song.artists,
                album: song.album,
                time_start: startTime,
                time_start_pretty: moment.utc(startTime * 1000).format('mm:ss'),
                time_end: durationTime + startTime,
                time_end_pretty: moment
                  .utc((durationTime + startTime) * 1000)
                  .format('mm:ss'),
              });
            }

            const performanceMetrics = await peloton.workoutPerformanceGraph({
              workoutId: rideId,
              everyN: 5,
            });

            const metrics = find(performanceMetrics.metrics, item => {
              return item.display_name === 'Output';
            });

            if (metrics) {
              const duration = performanceMetrics.duration;
              const timeArray: Array<number> = [];
              for (let i = 0; i < duration; i += 5) {
                timeArray.push(i);
              }

              const timeMap = metrics.values.map((item: any, num: number) => {
                return {
                  time: {
                    pretty: moment.utc(timeArray[num] * 1000).format('mm:ss'),
                    time_start: timeArray[num],
                    time_end: timeArray[num] + 5,
                  },
                  pretty: moment.utc(timeArray[num] * 1000).format('mm:ss'),
                  output: item,
                };
              });

              const sortedByOutput = orderBy(timeMap, ['output'], ['desc']);

              const slicedOutput = sortedByOutput.slice(
                0,
                sortedByOutput.length < 5 ? sortedByOutput.length : 5,
              );

              const topSongs = [];

              for (const slicedItem of slicedOutput) {
                const timeData = slicedItem.time;

                const songData = find(playlist, item => {
                  return (
                    timeData.time_start >= item.time_start &&
                    timeData.time_end <= item.time_end
                  );
                });

                if (songData) {
                  const findData = find(topSongs, item => {
                    return item.song.id === songData.id;
                  });

                  if (!findData) {
                    topSongs.push({
                      song: songData,
                      output: slicedItem.output,
                    });

                    const findUniqueSong = find(uniqueSongs, item => {
                      return item.id === songData.id;
                    });

                    if (!findUniqueSong) {
                      uniqueSongs.push(songData);
                    }
                  }
                }
              }

              const maxValue = maxItemInArray(timeMap, 'output');
              const minValue = minItemInArray(timeMap, 'output');

              workoutsWithOutput.push({
                workout: {
                  id: rideId,
                  name: workout.name,
                  intructor: rideDetails.ride.instructor
                    ? {
                        name: rideDetails.ride.instructor.name,
                        id: rideDetails.ride.instructor.id,
                        image_url: rideDetails.ride.instructor.image_url,
                      }
                    : {
                        id: null,
                        name: null,
                        image_url: null,
                      },
                  classTitle: workout.ride.title,
                  duration: performanceMetrics.duration,
                  createdAt: workout.created_at,
                  status: workout.status,
                  output: {
                    max: maxValue,
                    min: minValue,
                  },
                },
                topSongs,
              });
            }
          }
        }
      }
    }

    const responseBody = {
      uniqueSongs,
      workouts: workoutsWithOutput,
    };

    await storeWorkouts(accountId, responseBody, db);

    await disconnectDB();

    return res.status(200).json(responseBody);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Something unexpected happened.' });
  }
}
