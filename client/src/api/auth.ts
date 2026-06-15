import api from './axios.ts';
import type { User } from '../types/index.ts';

export const register = (name: string, email: string, password: string, timezone: string) =>
  api.post('/auth/register', { name, email, password, timezone });

export const login = async (email: string, password: string, timezone: string): Promise<{ token: string; user: User }> => {
  const res = await api.post('/auth/login', { email, password, timezone });
  return res.data;
};

export const logout = () => api.post('/auth/logout');

export const getMe = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data;
};
