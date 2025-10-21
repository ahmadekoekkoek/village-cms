import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { email, password: hashed, name, role }});
    res.json({ id: user.id, email: user.email });
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
}
