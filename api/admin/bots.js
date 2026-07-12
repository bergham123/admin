import { verifyAdmin } from '../../lib/auth.js';
import { readData, addBot, removeBot } from '../../lib/data.js';

export default async function (req, res) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Admin only' });

  if (req.method === 'GET') {
    const data = await readData();
    const bots = Object.entries(data.bots).map(([name, info]) => ({
      name,
      available: info.available,
      reserved_by: info.reserved_by || null,
    }));
    return res.json(bots);
  }

  if (req.method === 'POST') {
    const { botName } = req.body;
    if (!botName) return res.status(400).json({ error: 'botName required' });
    try {
      await addBot(botName);
      res.json({ message: `Bot ${botName} added. Please confirm after scanning QR.` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { botName } = req.body;
    if (!botName) return res.status(400).json({ error: 'botName required' });
    try {
      await removeBot(botName);
      res.json({ message: `Bot ${botName} removed` });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  res.status(405).end();
}
