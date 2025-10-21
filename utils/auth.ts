import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export function authenticate(handler: NextApiHandler, roles: string[] = []) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization header' });
    const token = parts[1];
    try {
      const payload:any = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ error: 'Forbidden' });
      // attach user to request
      (req as any).user = payload;
      return handler(req, res);
    } catch (e:any) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}
