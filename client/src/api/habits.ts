import api from './axios.ts';
import type { Habit, HabitWithStats, HabitCompletion, DashboardSummary, HabitStatus } from '../types/index.ts';

export const getHabits = async (status: HabitStatus = 'ACTIVE'): Promise<Habit[]> => {
  const res = await api.get('/habits', { params: { status } });
  return res.data;
};

export const getHabit = async (id: number): Promise<HabitWithStats> => {
  const res = await api.get(`/habits/${id}`);
  return res.data;
};

export const createHabit = (data: {
  title: string;
  description?: string;
  estimated_duration_minutes?: number;
  difficulty_level: string;
  frequency_type: string;
  target_frequency: number;
  grace_period_hours?: number;
}) => api.post('/habits', data);

export const updateHabit = (id: number, data: Partial<{
  title: string;
  description: string;
  difficulty_level: string;
  frequency_type: string;
  target_frequency: number;
  grace_period_hours: number;
  status: HabitStatus;
}>) => api.put(`/habits/${id}`, data);

export const deleteHabit = (id: number) => api.delete(`/habits/${id}`);

export const completeHabit = (id: number, completed_at: string, started_at?: string, notes?: string) =>
  api.post(`/habits/${id}/complete`, { completed_at, started_at, notes });

export const getCompletions = async (id: number): Promise<HabitCompletion[]> => {
  const res = await api.get(`/habits/${id}/completions`);
  return res.data;
};

export const getDashboard = async (): Promise<DashboardSummary> => {
  const res = await api.get('/dashboard/summary');
  return res.data;
};
