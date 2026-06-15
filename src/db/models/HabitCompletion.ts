import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

export type CompletionSource = 'MANUAL' | 'SYSTEM';

interface HabitCompletionAttributes {
  id: number;
  user_habit_id: number;
  started_at: Date | null;
  completed_at: Date;
  completion_date: string;
  duration_minutes: number | null;
  notes: string | null;
  completion_source: CompletionSource;
  created_at: Date;
}

interface HabitCompletionCreationAttributes
  extends Optional<HabitCompletionAttributes, 'id' | 'started_at' | 'duration_minutes' | 'notes' | 'completion_source' | 'created_at'> {}

export class HabitCompletion extends Model<HabitCompletionAttributes, HabitCompletionCreationAttributes>
  implements HabitCompletionAttributes {
  declare id: number;
  declare user_habit_id: number;
  declare started_at: Date | null;
  declare completed_at: Date;
  declare completion_date: string;
  declare duration_minutes: number | null;
  declare notes: string | null;
  declare completion_source: CompletionSource;
  declare created_at: Date;
}

HabitCompletion.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_habit_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    started_at: { type: DataTypes.DATE, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: false },
    completion_date: { type: DataTypes.DATEONLY, allowNull: false },
    duration_minutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    completion_source: { type: DataTypes.ENUM('MANUAL', 'SYSTEM'), allowNull: false, defaultValue: 'MANUAL' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'habit_completion_t', timestamps: false }
);
