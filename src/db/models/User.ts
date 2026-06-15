import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare timezone: string;
  declare created_at: Date;
  declare updated_at: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    timezone: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'UTC' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'users_t', timestamps: false }
);
