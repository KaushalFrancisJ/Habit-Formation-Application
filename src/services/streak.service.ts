import { DateTime } from 'luxon';
import { redisClient } from '../cache/redis.js';
import { getCompletionsInRange, getAllCompletions } from '../repositories/completion.repository.js';
import { getSetting } from '../config/appSettings.js';
import type { UserHabit } from '../db/models/UserHabit.js';

const STREAK_TTL_SECONDS = 3600;

const cacheKey = (userHabitId: number) => `streak:${userHabitId}`;

export interface StreakResult {
  current: number;
  longest: number;
}

const getGracePeriodHours = (userHabit: UserHabit): number => {
  if (userHabit.grace_period_hours !== null) return userHabit.grace_period_hours;
  const key = userHabit.frequency_type === 'DAILY' ? 'grace_period_daily_hours' : 'grace_period_weekly_hours';
  return parseInt(getSetting(key), 10);
};

const calculateDailyStreak = async (userHabit: UserHabit, timezone: string): Promise<StreakResult> => {
  const gracePeriodHours = getGracePeriodHours(userHabit);
  const now = DateTime.now().setZone(timezone);
  const today = now.toISODate()!;

  // Fetch all completions from started_at to today
  const startDate = DateTime.fromJSDate(userHabit.started_at).setZone(timezone).toISODate()!;
  const completions = await getCompletionsInRange(userHabit.id, startDate, today);
  const completedDates = new Set(completions.map((c) => c.completion_date));

  let current = 0;
  let longest = 0;
  let streak = 0;
  let checkDate = now;

  // If today not completed, allow grace period before breaking streak
  const todayCompleted = completedDates.has(today);
  const graceDeadline = now.minus({ hours: gracePeriodHours });
  const startOfToday = now.startOf('day');
  const withinGrace = !todayCompleted && graceDeadline < startOfToday;

  if (!todayCompleted && !withinGrace) {
    // today is still within grace, don't penalise yet — skip today in walk-back
    checkDate = now.minus({ days: 1 });
  }

  while (true) {
    const dateStr = checkDate.toISODate()!;
    if (dateStr < startDate) break;

    if (completedDates.has(dateStr)) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      if (streak > 0) break; // streak broken
    }
    checkDate = checkDate.minus({ days: 1 });
  }

  current = streak;
  return { current, longest };
};

const calculateWeeklyStreak = async (userHabit: UserHabit, timezone: string): Promise<StreakResult> => {
  const completions = await getAllCompletions(userHabit.id);
  const startDate = DateTime.fromJSDate(userHabit.started_at).setZone(timezone);
  const now = DateTime.now().setZone(timezone);

  // Build week windows from started_at to now
  let weekStart = startDate.startOf('week');
  const weeks: Array<{ from: string; to: string }> = [];

  while (weekStart <= now) {
    const weekEnd = weekStart.endOf('week');
    weeks.push({ from: weekStart.toISODate()!, to: weekEnd.toISODate()! });
    weekStart = weekStart.plus({ weeks: 1 });
  }

  // Count completions per week
  const completionsByWeek = weeks.map(({ from, to }) => ({
    from,
    to,
    count: completions.filter((c) => c.completion_date >= from && c.completion_date <= to).length,
  }));

  const gracePeriodHours = getGracePeriodHours(userHabit);
  const currentWeekEnd = now.endOf('week');
  const graceDeadline = currentWeekEnd.plus({ hours: gracePeriodHours });
  const isCurrentWeekGracePending = now < graceDeadline;

  let current = 0;
  let longest = 0;
  let streak = 0;

  // Walk back from most recent completed week
  for (let i = completionsByWeek.length - 1; i >= 0; i--) {
    const week = completionsByWeek[i];
    const isCurrentWeek = i === completionsByWeek.length - 1;

    // Skip current week if still within grace period
    if (isCurrentWeek && isCurrentWeekGracePending) continue;

    if (week.count >= userHabit.target_frequency) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      break;
    }
  }

  current = streak;
  return { current, longest };
};

export const calculateStreak = async (userHabit: UserHabit, timezone: string): Promise<StreakResult> => {
  // Skip streak calculation for paused/archived habits
  if (userHabit.status === 'PAUSED' || userHabit.status === 'ARCHIVED') {
    return { current: userHabit.current_streak_count, longest: userHabit.longest_streak_count };
  }

  const key = cacheKey(userHabit.id);

  if (redisClient) {
    const cached = await redisClient.get(key);
    if (cached) return JSON.parse(cached) as StreakResult;
  }

  const result = userHabit.frequency_type === 'DAILY'
    ? await calculateDailyStreak(userHabit, timezone)
    : await calculateWeeklyStreak(userHabit, timezone);

  if (redisClient) {
    await redisClient.set(key, JSON.stringify(result), 'EX', STREAK_TTL_SECONDS);
  }

  return result;
};

export const invalidateStreakCache = async (userHabitId: number): Promise<void> => {
  if (redisClient) await redisClient.del(cacheKey(userHabitId));
};
