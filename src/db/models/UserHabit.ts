import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

export type FrequencyType = 'DAILY' | 'WEEKLY';
export type UserHabitStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

interface UserHabitAttributes {
  id: number;
  user_id: number;
  habit_id: number;
  frequency_type: FrequencyType;
  target_frequency: number;
  grace_period_hours: number | null;
  status: UserHabitStatus;
  current_streak_count: number;
  longest_streak_count: number;
  started_at: Date;
  completed_at: Date | null;
  paused_at: Date | null;
  archived_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface UserHabitCreationAttributes
  extends Optional<UserHabitAttributes, 'id' | 'grace_period_hours' | 'status' | 'current_streak_count' | 'longest_streak_count' | 'started_at' | 'completed_at' | 'paused_at' | 'archived_at' | 'created_at' | 'updated_at'> {}

export class UserHabit extends Model<UserHabitAttributes, UserHabitCreationAttributes> implements UserHabitAttributes {
  declare id: number;
  declare user_id: number;
  declare habit_id: number;
  declare frequency_type: FrequencyType;
  declare target_frequency: number;
  declare grace_period_hours: number | null;
  declare status: UserHabitStatus;
  declare current_streak_count: number;
  declare longest_streak_count: number;
  declare started_at: Date;
  declare completed_at: Date | null;
  declare paused_at: Date | null;
  declare archived_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;
}

UserHabit.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    habit_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    frequency_type: { type: DataTypes.ENUM('DAILY', 'WEEKLY'), allowNull: false },
    target_frequency: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    grace_period_hours: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    status: { type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' },
    current_streak_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    longest_streak_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    paused_at: { type: DataTypes.DATE, allowNull: true },
    archived_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'user_habits_t', timestamps: false }
);
