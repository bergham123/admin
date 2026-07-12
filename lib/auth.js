import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function generateToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

// تحقق من أن المستخدم هو الأدمن (عنوان البريد الإلكتروني)
export async function verifyAdmin(req) {
  const user = await verifyToken(req);
  if (user && user.email === 'admin@example.com') return user;
  return null;
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
