import type { Request, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import { getUserHabits } from '../repositories/habit.repository.js';
import { getCompletionsInRange } from '../repositories/completion.repository.js';
import { calculateStreak } from '../services/streak.service.js';
import { calculateMissed } from '../services/missed.service.js';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, timezone } = req.session!;
    const now = DateTime.now().setZone(timezone);
    const today = now.toISODate()!;
    const weekStart = now.startOf('week').toISODate()!;
    const weekEnd = now.endOf('week').toISODate()!;

    const activeHabits = await getUserHabits(userId, 'ACTIVE');

    const habitStats = await Promise.all(
      activeHabits.map(async (uh) => {
        const [streak, missed, weeklyCompletions, todayCompletions] = await Promise.all([
          calculateStreak(uh, timezone),
          calculateMissed(uh, timezone),
          getCompletionsInRange(uh.id, weekStart, weekEnd),
          getCompletionsInRange(uh.id, today, today),
        ]);

        const weeklyProgress = {
          completed: weeklyCompletions.length,
          target: uh.frequency_type === 'WEEKLY' ? uh.target_frequency : 7,
        };

        return {
          userHabitId: uh.id,
          habitId: uh.habit_id,
          frequencyType: uh.frequency_type,
          currentStreak: streak.current,
          longestStreak: streak.longest,
          missedCount: missed,
          completedToday: todayCompletions.length > 0,
          weeklyProgress,
        };
      })
    );

    const totalCompletedToday = habitStats.filter((h) => h.completedToday).length;
    const totalWeeklyCompleted = habitStats.reduce((sum, h) => sum + h.weeklyProgress.completed, 0);
    const totalWeeklyTarget = habitStats.reduce((sum, h) => sum + h.weeklyProgress.target, 0);
    const completionPercentage = totalWeeklyTarget > 0
      ? Math.round((totalWeeklyCompleted / totalWeeklyTarget) * 100)
      : 0;

    res.json({
      totalActiveHabits: activeHabits.length,
      completedToday: totalCompletedToday,
      completionPercentage,
      habits: habitStats,
    });
  } catch (err) { next(err); }
};
