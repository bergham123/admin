import { hashPassword } from '../../lib/auth.js';
import { getUser, updateUser } from '../../lib/data.js';

export default async function (req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  const existing = await getUser(email);
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const hashed = await hashPassword(password);
  await updateUser(email, { password: hashed, accounts: [], messages: [], schedule: null });

  res.status(201).json({ message: 'User created' });
}
