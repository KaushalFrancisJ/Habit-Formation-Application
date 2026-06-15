import { DateTime } from 'luxon';
import * as completionRepo from '../repositories/completion.repository.js';
import * as habitRepo from '../repositories/habit.repository.js';
import { invalidateStreakCache, calculateStreak } from './streak.service.js';
import type { CompleteHabitInput } from '../validators/habit.validator.js';
import type { UserHabit } from '../db/models/UserHabit.js';

const deriveCompletionDate = (completedAt: string, timezone: string): string =>
  DateTime.fromISO(completedAt, { zone: 'utc' }).setZone(timezone).toISODate()!;

const validateNoDuplicate = async (userHabit: UserHabit, completionDate: string) => {
  if (userHabit.frequency_type === 'DAILY') {
    const existing = await completionRepo.getCompletionsByDate(userHabit.id, completionDate);
    if (existing.length > 0) {
      throw Object.assign(new Error('Habit already completed for this date'), { status: 409 });
    }
  } else {
    // WEEKLY: count completions in the same week window
    const dt = DateTime.fromISO(completionDate);
    const weekStart = dt.startOf('week').toISODate()!;
    const weekEnd = dt.endOf('week').toISODate()!;
    const existing = await completionRepo.getCompletionsInRange(userHabit.id, weekStart, weekEnd);
    if (existing.length >= userHabit.target_frequency) {
      throw Object.assign(
        new Error(`Weekly target of ${userHabit.target_frequency} already reached`),
        { status: 409 }
      );
    }
  }
};

export const logCompletion = async (
  userHabit: UserHabit,
  input: CompleteHabitInput,
  timezone: string
) => {
  if (userHabit.status !== 'ACTIVE') {
    throw Object.assign(new Error('Cannot complete a habit that is not active'), { status: 400 });
  }

  const completionDate = deriveCompletionDate(input.completed_at, timezone);
  await validateNoDuplicate(userHabit, completionDate);

  const completion = await completionRepo.createCompletion(
    userHabit.id,
    new Date(input.completed_at),
    completionDate,
    input.started_at ? new Date(input.started_at) : undefined,
    input.started_at
      ? Math.round((new Date(input.completed_at).getTime() - new Date(input.started_at).getTime()) / 60000)
      : undefined,
    input.notes
  );

  await invalidateStreakCache(userHabit.id);

  // Update cached streak counts on user_habits_t
  const streak = await calculateStreak(userHabit, timezone);
  await habitRepo.updateStreakCounts(userHabit.id, streak.current, streak.longest);

  return completion;
};

export const getCompletions = (userHabitId: number) =>
  completionRepo.getAllCompletions(userHabitId);
