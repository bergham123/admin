import { comparePassword } from '../../lib/auth.js';
import { generateToken } from '../../lib/auth.js';
import { getUser } from '../../lib/data.js';

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;

  const user = await getUser(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await comparePassword(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken(email);
  res.json({ token });
}
