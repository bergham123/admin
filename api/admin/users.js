import { verifyAdmin } from '../../lib/auth.js';
import { readData, writeData, updateUser, deleteUser, releaseBot } from '../../lib/data.js';

export default async function (req, res) {
  const admin = await verifyAdmin(req);
  if (!admin) return res.status(401).json({ error: 'Admin only' });

  if (req.method === 'GET') {
    const data = await readData();
    const users = Object.entries(data.users).map(([email, info]) => ({
      email,
      reserved_bot: info.reserved_bot || null,
      accounts: info.accounts || [],
      messages: info.messages || [],
      schedule: info.schedule || null,
    }));
    return res.json(users);
  }

  if (req.method === 'PUT') {
    const { email, accounts, messages, schedule, reserved_bot } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    const updates = {};
    if (accounts !== undefined) updates.accounts = accounts;
    if (messages !== undefined) updates.messages = messages;
    if (schedule !== undefined) updates.schedule = schedule;
    // إذا تم تغيير البوت المحجوز
    if (reserved_bot !== undefined) {
      // أولاً نحرر البوت القديم (إن وجد)
      const userData = await getUser(email);
      if (userData && userData.reserved_bot) {
        await releaseBot(userData.reserved_bot);
      }
      if (reserved_bot) {
        // نحجز البوت الجديد للمستخدم (يجب أن يكون متاحاً)
        // سنقوم بذلك عبر دالة خاصة
        const data = await readData();
        if (!data.bots[reserved_bot] || data.bots[reserved_bot].available !== true) {
          return res.status(400).json({ error: 'Bot not available' });
        }
        data.bots[reserved_bot].available = false;
        data.bots[reserved_bot].reserved_by = email;
        updates.reserved_bot = reserved_bot;
        await writeData(data);
      } else {
        updates.reserved_bot = null;
      }
    }
    await updateUser(email, updates);
    return res.json({ message: 'User updated' });
  }

  if (req.method === 'DELETE') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    await deleteUser(email);
    return res.json({ message: 'User deleted' });
  }

  res.status(405).end();
}
