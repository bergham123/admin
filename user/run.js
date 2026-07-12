import { verifyToken } from '../../lib/auth.js';
import { getUser } from '../../lib/data.js';
import { triggerWorkflow } from '../../lib/github.js';

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = await verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const userData = await getUser(user.email);
  if (!userData || !userData.reserved_bot) {
    return res.status(400).json({ error: 'No bot reserved' });
  }

  try {
    await triggerWorkflow(userData.reserved_bot);
    res.json({ message: 'Workflow triggered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
