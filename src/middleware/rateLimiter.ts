import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import type { Request } from 'express';

export const publicLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_PUBLIC,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

export const protectedLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_PROTECTED,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = req.session?.userId ?? 'anon';
    return `${req.ip}:${userId}`;
  },
  message: { message: 'Too many requests, please try again later' },
});
