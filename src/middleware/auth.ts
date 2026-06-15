import type { Request, Response, NextFunction } from 'express';
import { validateSession } from '../services/auth.service.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const session = await validateSession(token);
    req.session = { userId: session.userId, sessionToken: token, timezone: session.timezone };
    next();
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 401;
    const message = err instanceof Error ? err.message : 'Unauthorized';
    res.status(status).json({ message });
  }
};
