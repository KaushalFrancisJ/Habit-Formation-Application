import { Op } from 'sequelize';
import { User } from '../db/models/User.js';
import { UserPassword } from '../db/models/UserPassword.js';
import { UserSession } from '../db/models/UserSession.js';

export const findUserByEmail = (email: string) =>
  User.findOne({ where: { email } });

export const findUserById = (id: number) =>
  User.findByPk(id);

export const createUser = (name: string, email: string, timezone: string) =>
  User.create({ name, email, timezone });

export const getLatestPassword = (userId: number) =>
  UserPassword.findOne({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });

export const getAllPasswordHashes = async (userId: number): Promise<string[]> => {
  const records = await UserPassword.findAll({ where: { user_id: userId } });
  return records.map((r) => r.password_hash);
};

export const createPassword = (userId: number, passwordHash: string) =>
  UserPassword.create({ user_id: userId, password_hash: passwordHash });

export const countActiveSessions = (userId: number) =>
  UserSession.count({ where: { user_id: userId, is_active: true } });

export const getOldestActiveSession = (userId: number) =>
  UserSession.findOne({
    where: { user_id: userId, is_active: true },
    order: [['created_at', 'ASC']],
  });

export const createSession = (sessionToken: string, userId: number, timezone: string) =>
  UserSession.create({ session_token: sessionToken, user_id: userId, timezone });

export const findActiveSession = (sessionToken: string) =>
  UserSession.findOne({ where: { session_token: sessionToken, is_active: true } });

export const updateSessionLastAccessed = (sessionToken: string) =>
  UserSession.update(
    { last_accessed_at: new Date() },
    { where: { session_token: sessionToken } }
  );

export const deactivateSession = (sessionToken: string) =>
  UserSession.update({ is_active: false }, { where: { session_token: sessionToken } });

export const deactivateSessionById = (sessionToken: string) =>
  deactivateSession(sessionToken);
