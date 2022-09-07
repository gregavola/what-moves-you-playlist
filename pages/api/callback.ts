import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { addUser } from '../../utils/crudUser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });

  try {
    if (!session) {
      return res.status(401).json({ error: 'Not Logged In' });
    }

    const accountId = session.userId as string;

    if (!accountId) {
      return res.status(500).json({ error: 'No Account ID' });
    }

    await addUser({
      accountId,
      name: session.user?.name as string,
      avatar: session.user?.image as string,
      email: session.user?.email as string,
      refreshToken: session.refreshToken as string,
      accessToken: session.accessToken as string,
      expiresIn: session.expiresIn as number,
    });

    return res.redirect(301, '/auth');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: 'Something unexpected happened.' });
  }
}
