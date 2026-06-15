import { Op } from 'sequelize';
import { HabitCompletion } from '../db/models/HabitCompletion.js';

export const getCompletionsByDate = (userHabitId: number, date: string) =>
  HabitCompletion.findAll({ where: { user_habit_id: userHabitId, completion_date: date } });

export const getCompletionsInRange = (userHabitId: number, from: string, to: string) =>
  HabitCompletion.findAll({
    where: {
      user_habit_id: userHabitId,
      completion_date: { [Op.between]: [from, to] },
    },
    order: [['completion_date', 'ASC']],
  });

export const getAllCompletions = (userHabitId: number) =>
  HabitCompletion.findAll({
    where: { user_habit_id: userHabitId },
    order: [['completion_date', 'ASC']],
  });

export const createCompletion = (
  userHabitId: number,
  completedAt: Date,
  completionDate: string,
  startedAt?: Date,
  durationMinutes?: number,
  notes?: string
) =>
  HabitCompletion.create({
    user_habit_id: userHabitId,
    completed_at: completedAt,
    completion_date: completionDate,
    started_at: startedAt ?? null,
    duration_minutes: durationMinutes ?? null,
    notes: notes ?? null,
    completion_source: 'MANUAL',
  });

export const countCompletionsForUser = (userId: number, date: string) =>
  HabitCompletion.count({
    include: [
      {
        association: 'userHabit',
        where: { user_id: userId },
        required: true,
      },
    ],
    where: { completion_date: date },
  });
