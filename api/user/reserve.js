import { verifyToken } from '../../lib/auth.js';
import { reserveBot } from '../../lib/data.js';

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { botName } = req.body;
  if (!botName) return res.status(400).json({ error: 'botName required' });

  try {
    await reserveBot(user.email, botName);
    res.json({ message: `Bot ${botName} reserved successfully` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
