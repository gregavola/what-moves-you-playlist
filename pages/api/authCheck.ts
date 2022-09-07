// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { removePeloton } from "../../utils/crudUser";
import { getAuthUser } from "../../utils/getUserAuth";
import pelotonInstance from "../../utils/peloton";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession({ req });

    if (session) {
      const accountId = session.userId as string;

      const authUser = await getAuthUser(accountId);

      if (authUser) {
        if (authUser.pelotonCookie !== "") {
          try {
            const peloton = await pelotonInstance(authUser.pelotonCookie);

            const meData = await peloton.me();

            return res.json({
              status: "OK",
              me: {
                userId: meData.id,
                userName: meData.user_name,
                firstName: meData.first_name,
                lastName: meData.last_name,
                location: meData.location,
              },
            });
          } catch (err) {
            await removePeloton({ accountId });

            return res.status(500).json({
              status: "ERROR",
              error: "Peloton Link Expired",
              errorCode: "invalidPeloton",
            });
          }
        } else {
          return res.status(500).json({
            status: "ERROR",
            error: "No Peloton Account Linked",
            errorCode: "noPeloton",
          });
        }
      } else {
        return res.status(500).json({
          status: "ERROR",
          error: "User Not Found",
          errorCode: "notFound",
        });
      }
    } else {
      return res.status(401).json({ error: "Not Authorized" });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: `Unknown Error` });
  }
}
