export interface User {
  id: number;
  name: string;
  email: string;
  timezone: string;
}

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type FrequencyType = 'DAILY' | 'WEEKLY';
export type HabitStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export interface HabitTemplate {
  id: number;
  title: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  difficulty_level: DifficultyLevel;
  source: string;
}

export interface Habit {
  id: number;
  habit_id: number;
  habit_t: HabitTemplate;
  frequency_type: FrequencyType;
  target_frequency: number;
  grace_period_hours: number | null;
  status: HabitStatus;
  current_streak_count: number;
  longest_streak_count: number;
  started_at: string;
}

export interface HabitCompletion {
  id: number;
  user_habit_id: number;
  completed_at: string;
  completion_date: string;
  duration_minutes: number | null;
  notes: string | null;
}

export interface StreakResult {
  current: number;
  longest: number;
}

export interface HabitWithStats {
  userHabit: Habit;
  streak: StreakResult;
  missed: number;
}

export interface WeeklyProgress {
  completed: number;
  target: number;
}

export interface HabitStat {
  userHabitId: number;
  habitId: number;
  frequencyType: FrequencyType;
  currentStreak: number;
  longestStreak: number;
  missedCount: number;
  completedToday: boolean;
  weeklyProgress: WeeklyProgress;
}

export interface DashboardSummary {
  totalActiveHabits: number;
  completedToday: number;
  completionPercentage: number;
  habits: HabitStat[];
}
