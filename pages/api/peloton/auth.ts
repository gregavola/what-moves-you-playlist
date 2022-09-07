import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { addPeloton } from '../../../utils/crudUser';
import { peloton } from 'peloton-client-node';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const session = await getSession({ req });

    if (session) {
      const accountId = session.userId as string;

      const username = req.body.username;
      const password = req.body.password;

      if (username && password) {
        const peltonInfo = await peloton.authenticate({
          username,
          password,
        });

        if (peltonInfo.status !== 200 || !peltonInfo) {
          res.status(422).json({ error: 'Invalid username and/or password.' });
        } else {
          try {
            const myInfo = await peloton.me();

            await addPeloton({
              pelotonCookie: peloton.getToken(),
              pelotonUserId: myInfo.id,
              accountId,
            });

            res.json({ status: 'OK' });
          } catch (err) {
            res.status(422).json({
              error: err.message ? err.message : 'Unknown Error',
            });
          }
        }
      } else {
        res
          .status(422)
          .json({ error: 'You must enter a username or password.' });
      }
    } else {
      res.status(401).json({ error: 'Not Logged In' });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res
      .status(500)
      .json({ error: 'Something unexpected happened. Please try again.' });
  }
}
