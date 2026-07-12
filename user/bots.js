import { verifyToken } from '../../lib/auth.js';
import { getAvailableBots, readData } from '../../lib/data.js';

export default async function (req, res) {
  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const available = await getAvailableBots();
    // نعيد أيضاً قائمة بجميع البوتات مع حالتها (للعرض)
    const data = await readData();
    const allBots = Object.entries(data.bots).map(([name, info]) => ({
      name,
      available: info.available,
      reserved_by: info.reserved_by || null,
    }));
    return res.json({ available, all: allBots });
  }

  res.status(405).end();
}
