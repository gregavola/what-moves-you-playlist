// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import pelotonInstance from "../../../utils/peloton";
import moment from "moment";
import { getSession } from "next-auth/react";
import { getValidWorkouts, getWorkouts } from "../../../utils/workouts";
import { connectDB, disconnectDB } from "../../../utils/db";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import {
  clearQueue,
  createQueue,
  getCurrentQueue,
  updateMessageId,
} from "../../../utils/queues";
import { v4 as uuidv4 } from "uuid";
import { getAuthUser } from "../../../utils/getUserAuth";

const sendMessage = async (payload: any) => {
  const sqsClient = new SQSClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.CUST_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CUST_AWS_SECRET_ACCESS_KEY,
    },
  });

  // Set the parameters
  let params = {
    MessageBody: JSON.stringify(payload),
    QueueUrl: `https://sqs.us-east-1.amazonaws.com/726013842547/whatMovesYouPlaylistDP`,
  };

  const data = await sqsClient.send(new SendMessageCommand(params));
  return data;
};

// eslint-disable-next-line consistent-return
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  try {
    if (!session) {
      return res.status(401).json({ error: "Not Logged In" });
    }

    const accountId = session.userId as string;

    const authUser = await getAuthUser(accountId);

    if (!authUser) {
      return res.status(500).json({ error: "Invalid User" });
    }

    const db = await connectDB();

    const workouts = await getWorkouts(accountId, db);

    if (!workouts) {
      const queueStatus = await getCurrentQueue(accountId, db);

      if (!queueStatus) {
        const peloton = await pelotonInstance(authUser.pelotonCookie);
        const userId = authUser.pelotonUserId;

        const todayDate = moment(new Date()).utc().toISOString();
        const priorDate = moment(new Date())
          .utc()
          .subtract(45, "days")
          .toISOString();

        const params = {
          userId,
          to: todayDate,
          from: priorDate,
          stats_from: priorDate,
          stats_to: todayDate,
          joins: "ride",
        };

        const workouts = await peloton.workouts(params);

        if (workouts?.data?.length === 0) {
          return res.json({ status: "NO_DATA", workouts: [] });
        }

        if (!getValidWorkouts(workouts?.data)) {
          return res.json({ status: "NO_DATA_VALID", workouts: [] });
        }

        const queueId = uuidv4();

        const payload = {
          queueId,
          accountId,
        };

        const data = await sendMessage(payload);

        await createQueue(accountId, queueId, data.MessageId, db);

        const newQueueStatus = await getCurrentQueue(accountId, db);

        await disconnectDB();

        return res.json(newQueueStatus);
      } else {
        if (queueStatus.status === "COMPLETE") {
          const workouts = await getWorkouts(accountId, db);

          if (workouts) {
            await disconnectDB();
            return res.json(workouts);
          }

          await clearQueue(accountId, db);

          const payload = {
            queueId: queueStatus.queueId,
            accountId,
          };

          const data = await sendMessage(payload);

          await updateMessageId(accountId, data.MessageId, db);

          const newQueueStatus = await getCurrentQueue(accountId, db);

          await disconnectDB();

          return res.json(newQueueStatus);
        } else {
          return res.json(queueStatus);
        }
      }
    } else {
      await disconnectDB();
      return res.json(workouts);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Something unexpected happened." });
  }
}
