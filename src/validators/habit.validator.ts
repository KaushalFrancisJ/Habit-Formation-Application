import { z } from 'zod';

export const createHabitSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  difficulty_level: z.enum(['EASY', 'MEDIUM', 'HARD']),
  frequency_type: z.enum(['DAILY', 'WEEKLY']),
  target_frequency: z.number().int().min(1),
  grace_period_hours: z.number().int().min(0).optional(),
});

export const updateHabitSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  estimated_duration_minutes: z.number().int().positive().optional(),
  difficulty_level: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  frequency_type: z.enum(['DAILY', 'WEEKLY']).optional(),
  target_frequency: z.number().int().min(1).optional(),
  grace_period_hours: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const completeHabitSchema = z.object({
  completed_at: z.string().datetime(),
  started_at: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CompleteHabitInput = z.infer<typeof completeHabitSchema>;
