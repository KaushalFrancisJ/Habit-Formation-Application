import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  const status = (err as { status?: number }).status ?? 500;
  const message = err instanceof Error ? err.message : 'Internal server error';

  if (status >= 500) {
    console.error(err instanceof Error ? err.stack : err);
  } else {
    console.log(`[${status}] ${message}`);
  }

  res.status(status).json({ message });
};
