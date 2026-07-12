import { getUser, updateUser } from '../../lib/data.js';
import { updateFile } from '../../lib/github.js';
import { verifyToken } from '../../lib/auth.js';

export default async function (req, res) {
  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const email = user.email;
  const userData = await getUser(email);
  if (!userData) return res.status(404).json({ error: 'User not found' });

  if (req.method === 'GET') {
    return res.json({
      accounts: userData.accounts || [],
      messages: userData.messages || [],
      schedule: userData.schedule || null,
      reserved_bot: userData.reserved_bot || null,
    });
  }

  if (req.method === 'PUT') {
    const { accounts, messages, schedule } = req.body;
    // تحديث في data.json
    await updateUser(email, { accounts, messages, schedule });

    // تحديث الملفات في المستودع المحجوز (إن وجد)
    const bot = userData.reserved_bot;
    if (bot) {
      try {
        await updateFile(bot, 'accounts.json', JSON.stringify(accounts, null, 2));
        await updateFile(bot, 'message.json', JSON.stringify(messages, null, 2));
      } catch (err) {
        console.error('Error updating bot files:', err);
        return res.status(500).json({ error: 'Failed to update bot files' });
      }
    }
    return res.json({ message: 'Updated successfully' });
  }

  res.status(405).end();
}
