import { DateTime } from 'luxon';
import { getCompletionsInRange, getAllCompletions } from '../repositories/completion.repository.js';
import { getSetting } from '../config/appSettings.js';
import type { UserHabit } from '../db/models/UserHabit.js';

const getGracePeriodHours = (userHabit: UserHabit): number => {
  if (userHabit.grace_period_hours !== null) return userHabit.grace_period_hours;
  const key = userHabit.frequency_type === 'DAILY' ? 'grace_period_daily_hours' : 'grace_period_weekly_hours';
  return parseInt(getSetting(key), 10);
};

export const calculateMissed = async (userHabit: UserHabit, timezone: string): Promise<number> => {
  if (userHabit.status === 'PAUSED' || userHabit.status === 'ARCHIVED') return 0;

  const now = DateTime.now().setZone(timezone);
  const startDate = DateTime.fromJSDate(userHabit.started_at).setZone(timezone);
  const gracePeriodHours = getGracePeriodHours(userHabit);

  if (userHabit.frequency_type === 'DAILY') {
    const today = now.toISODate()!;
    const start = startDate.toISODate()!;
    const completions = await getCompletionsInRange(userHabit.id, start, today);
    const completedDates = new Set(completions.map((c) => c.completion_date));

    let missed = 0;
    let day = startDate.startOf('day');

    while (day.toISODate()! <= today) {
      const dateStr = day.toISODate()!;
      const isToday = dateStr === today;
      const graceExpired = now > day.plus({ hours: 24 + gracePeriodHours });

      if (!completedDates.has(dateStr) && (!isToday || graceExpired)) {
        missed++;
      }
      day = day.plus({ days: 1 });
    }
    return missed;
  }

  // WEEKLY
  const completions = await getAllCompletions(userHabit.id);
  let weekStart = startDate.startOf('week');
  let missed = 0;

  while (weekStart <= now) {
    const weekEnd = weekStart.endOf('week');
    const graceDeadline = weekEnd.plus({ hours: gracePeriodHours });
    const weekPassed = now > graceDeadline;
    const isCurrentWeek = weekStart <= now && now <= weekEnd;

    if (!isCurrentWeek && weekPassed) {
      const count = completions.filter(
        (c) => c.completion_date >= weekStart.toISODate()! && c.completion_date <= weekEnd.toISODate()!
      ).length;
      if (count < userHabit.target_frequency) missed++;
    }

    weekStart = weekStart.plus({ weeks: 1 });
  }

  return missed;
};
