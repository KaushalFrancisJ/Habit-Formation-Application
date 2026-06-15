import { Op } from 'sequelize';
import { Habit } from '../db/models/Habit.js';
import { UserHabit } from '../db/models/UserHabit.js';
import type { UserHabitStatus } from '../db/models/UserHabit.js';
import type { CreateHabitInput, UpdateHabitInput } from '../validators/habit.validator.js';

export const createHabitWithUserHabit = async (
  userId: number,
  input: CreateHabitInput
) => {
  const habit = await Habit.create({
    title: input.title,
    description: input.description ?? null,
    estimated_duration_minutes: input.estimated_duration_minutes ?? null,
    difficulty_level: input.difficulty_level,
    source: 'USER',
    created_by_user_id: userId,
  });

  const userHabit = await UserHabit.create({
    user_id: userId,
    habit_id: habit.id,
    frequency_type: input.frequency_type,
    target_frequency: input.target_frequency,
    grace_period_hours: input.grace_period_hours ?? null,
  });

  return { habit, userHabit };
};

export const getUserHabits = (userId: number, status?: UserHabitStatus) =>
  UserHabit.findAll({
    where: { user_id: userId, ...(status ? { status } : {}) },
    include: [{ model: Habit, as: 'habit_t', where: { deleted_at: null }, required: true }],
    order: [['created_at', 'DESC']],
  });

export const getUserHabitById = (id: number, userId: number) =>
  UserHabit.findOne({
    where: { id, user_id: userId },
    include: [{ model: Habit, as: 'habit_t', where: { deleted_at: null }, required: true }],
  });

export const updateHabitAndUserHabit = async (
  userHabit: UserHabit,
  habit: Habit,
  input: UpdateHabitInput
) => {
  const { title, description, estimated_duration_minutes, difficulty_level, frequency_type, target_frequency, grace_period_hours, status } = input;

  if (title !== undefined) habit.title = title;
  if (description !== undefined) habit.description = description;
  if (estimated_duration_minutes !== undefined) habit.estimated_duration_minutes = estimated_duration_minutes;
  if (difficulty_level !== undefined) habit.difficulty_level = difficulty_level;
  habit.updated_at = new Date();
  await habit.save();

  if (frequency_type !== undefined) userHabit.frequency_type = frequency_type;
  if (target_frequency !== undefined) userHabit.target_frequency = target_frequency;
  if (grace_period_hours !== undefined) userHabit.grace_period_hours = grace_period_hours;
  if (status !== undefined) {
    userHabit.status = status;
    const now = new Date();
    if (status === 'PAUSED') userHabit.paused_at = now;
    if (status === 'COMPLETED') userHabit.completed_at = now;
    if (status === 'ARCHIVED') userHabit.archived_at = now;
    if (status === 'ACTIVE') userHabit.paused_at = null;
  }
  userHabit.updated_at = new Date();
  await userHabit.save();

  return { habit, userHabit };
};

export const softDeleteHabit = async (userHabit: UserHabit, habit: Habit) => {
  habit.deleted_at = new Date();
  await habit.save();
  userHabit.status = 'ARCHIVED';
  userHabit.archived_at = new Date();
  await userHabit.save();
};

export const updateStreakCounts = (userHabitId: number, current: number, longest: number) =>
  UserHabit.update(
    { current_streak_count: current, longest_streak_count: longest },
    { where: { id: userHabitId } }
  );
