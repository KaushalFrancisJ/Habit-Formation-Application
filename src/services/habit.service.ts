import * as habitRepo from '../repositories/habit.repository.js';
import { calculateStreak } from './streak.service.js';
import { calculateMissed } from './missed.service.js';
import type { CreateHabitInput, UpdateHabitInput } from '../validators/habit.validator.js';
import type { UserHabitStatus } from '../db/models/UserHabit.js';
import { Habit } from '../db/models/Habit.js';

export const createHabit = (userId: number, input: CreateHabitInput) =>
  habitRepo.createHabitWithUserHabit(userId, input);

export const listHabits = (userId: number, status?: UserHabitStatus) =>
  habitRepo.getUserHabits(userId, status);

export const getHabit = async (id: number, userId: number) => {
  const userHabit = await habitRepo.getUserHabitById(id, userId);
  if (!userHabit) throw Object.assign(new Error('Habit not found'), { status: 404 });
  return userHabit;
};

export const updateHabit = async (id: number, userId: number, input: UpdateHabitInput) => {
  const userHabit = await habitRepo.getUserHabitById(id, userId);
  if (!userHabit) throw Object.assign(new Error('Habit not found'), { status: 404 });

  const habit = userHabit.get('habit_t') as Habit;
  return habitRepo.updateHabitAndUserHabit(userHabit, habit, input);
};

export const deleteHabit = async (id: number, userId: number) => {
  const userHabit = await habitRepo.getUserHabitById(id, userId);
  if (!userHabit) throw Object.assign(new Error('Habit not found'), { status: 404 });

  const habit = userHabit.get('habit_t') as Habit;
  await habitRepo.softDeleteHabit(userHabit, habit);
};

export const getHabitWithStats = async (id: number, userId: number, timezone: string) => {
  const userHabit = await getHabit(id, userId);
  const [streak, missed] = await Promise.all([
    calculateStreak(userHabit, timezone),
    calculateMissed(userHabit, timezone),
  ]);
  return { userHabit, streak, missed };
};
