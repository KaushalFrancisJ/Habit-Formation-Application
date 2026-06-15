import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type HabitSource = 'USER' | 'SYSTEM';

interface HabitAttributes {
  id: number;
  title: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  difficulty_level: DifficultyLevel;
  source: HabitSource;
  created_by_user_id: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface HabitCreationAttributes
  extends Optional<HabitAttributes, 'id' | 'description' | 'estimated_duration_minutes' | 'source' | 'created_by_user_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class Habit extends Model<HabitAttributes, HabitCreationAttributes> implements HabitAttributes {
  declare id: number;
  declare title: string;
  declare description: string | null;
  declare estimated_duration_minutes: number | null;
  declare difficulty_level: DifficultyLevel;
  declare source: HabitSource;
  declare created_by_user_id: number | null;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at: Date | null;
}

Habit.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    estimated_duration_minutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    difficulty_level: { type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'), allowNull: false },
    source: { type: DataTypes.ENUM('USER', 'SYSTEM'), allowNull: false, defaultValue: 'USER' },
    created_by_user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'habits_t', timestamps: false }
);
