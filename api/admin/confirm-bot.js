import { verifyAdmin } from '../../lib/auth.js';
import { confirmBot } from '../../lib/data.js';

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Admin only' });

  const { botName } = req.body;
  if (!botName) return res.status(400).json({ error: 'botName required' });

  try {
    await confirmBot(botName);
    res.json({ message: `Bot ${botName} confirmed and now available` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
