import { Request, Response, NextFunction } from 'express';
import db from '../db/connection';
import { compareToken } from '../utils/crypto';

export async function adminAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const now = new Date().toISOString();

  // Get all non-expired tokens
  const tokenRows = db
    .prepare('SELECT token_hash FROM admin_tokens WHERE expires_at > ?')
    .all(now) as { token_hash: string }[];

  // Compare the provided token against each stored hash
  for (const row of tokenRows) {
    const match = await compareToken(token, row.token_hash);
    if (match) {
      next();
      return;
    }
  }

  res.status(401).json({ error: 'Invalid or expired token' });
}
