import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

interface UserSessionAttributes {
  session_token: string;
  user_id: number;
  timezone: string;
  last_accessed_at: Date;
  is_active: boolean;
  created_at: Date;
}

interface UserSessionCreationAttributes extends Optional<UserSessionAttributes, 'last_accessed_at' | 'is_active' | 'created_at'> {}

export class UserSession extends Model<UserSessionAttributes, UserSessionCreationAttributes>
  implements UserSessionAttributes {
  declare session_token: string;
  declare user_id: number;
  declare timezone: string;
  declare last_accessed_at: Date;
  declare is_active: boolean;
  declare created_at: Date;
}

UserSession.init(
  {
    session_token: { type: DataTypes.STRING(512), primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    timezone: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'UTC' },
    last_accessed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'user_sessions_t', timestamps: false }
);
