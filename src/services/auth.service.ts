import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getSettingInt } from '../config/appSettings.js';
import { memCache } from '../cache/memCache.js';
import * as authRepo from '../repositories/auth.repository.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';

const BCRYPT_ROUNDS = 12;

interface SessionCacheEntry {
  userId: number;
  lastAccessedAt: number;
  timezone: string;
}

const sessionCacheKey = (token: string) => `session:${token}`;

export const register = async (input: RegisterInput) => {
  const existing = await authRepo.findUserByEmail(input.email);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const user = await authRepo.createUser(input.name, input.email, input.timezone ?? 'UTC');
  const hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  await authRepo.createPassword(user.id, hash);

  return { id: user.id, name: user.name, email: user.email };
};

export const login = async (input: LoginInput) => {
  const user = await authRepo.findUserByEmail(input.email);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const latestPassword = await authRepo.getLatestPassword(user.id);
  if (!latestPassword) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const valid = await bcrypt.compare(input.password, latestPassword.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const maxSessions = getSettingInt('max_concurrent_sessions');
  const activeCount = await authRepo.countActiveSessions(user.id);

  if (activeCount >= maxSessions) {
    const oldest = await authRepo.getOldestActiveSession(user.id);
    if (oldest) {
      await authRepo.deactivateSession(oldest.session_token);
      memCache.del(sessionCacheKey(oldest.session_token));
    }
  }

  const timezone = input.timezone ?? user.timezone;
  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

  await authRepo.createSession(token, user.id, timezone);

  const ttlMs = getSettingInt('session_idle_timeout_ms');
  memCache.set<SessionCacheEntry>(sessionCacheKey(token), {
    userId: user.id,
    lastAccessedAt: Date.now(),
    timezone,
  }, ttlMs);

  return { token, user: { id: user.id, name: user.name, email: user.email, timezone } };
};

export const logout = async (token: string) => {
  memCache.del(sessionCacheKey(token));
  await authRepo.deactivateSession(token);
};

export const validateSession = async (token: string): Promise<SessionCacheEntry> => {
  const ttlMs = getSettingInt('session_idle_timeout_ms');
  const cacheKey = sessionCacheKey(token);

  const cached = memCache.get<SessionCacheEntry>(cacheKey);
  if (cached) {
    memCache.set(cacheKey, { ...cached, lastAccessedAt: Date.now() }, ttlMs);
    return cached;
  }

  // verify JWT signature and expiry first
  jwt.verify(token, env.JWT_SECRET);

  const session = await authRepo.findActiveSession(token);
  if (!session) throw Object.assign(new Error('Session not found'), { status: 401 });

  const idleMs = Date.now() - new Date(session.last_accessed_at).getTime();
  if (idleMs > ttlMs) {
    await authRepo.deactivateSession(token);
    throw Object.assign(new Error('Session expired'), { status: 401 });
  }

  await authRepo.updateSessionLastAccessed(token);

  const entry: SessionCacheEntry = {
    userId: session.user_id,
    lastAccessedAt: Date.now(),
    timezone: session.timezone,
  };
  memCache.set(cacheKey, entry, ttlMs);
  return entry;
};
