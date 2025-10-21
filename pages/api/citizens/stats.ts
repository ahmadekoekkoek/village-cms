import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticate } from '../../../utils/auth';

export default authenticate(async (req: NextApiRequest, res: NextApiResponse) => {
  const total = await prisma.citizen.count();
  const byGender = await prisma.$queryRaw`SELECT gender, COUNT(*)::int as count FROM "Citizen" GROUP BY gender`;
  const byRt = await prisma.$queryRaw`SELECT rt as rt, COUNT(*)::int as count FROM "Citizen" GROUP BY rt ORDER BY rt`;
  res.json({ total, byGender, byRt });
}, ['ADMIN','OPERATOR']);
