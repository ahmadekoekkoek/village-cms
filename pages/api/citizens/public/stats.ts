import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // public-safe aggregated view
  const total = await prisma.citizen.count();
  const byRt = await prisma.$queryRaw`SELECT rt as rt, COUNT(*)::int as count FROM "Citizen" GROUP BY rt ORDER BY rt`;
  res.json({ total, byRt });
}
