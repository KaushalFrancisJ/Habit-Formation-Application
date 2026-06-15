import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../sequelize.js';

interface UserPasswordAttributes {
  id: number;
  user_id: number;
  password_hash: string;
  created_at: Date;
}

interface UserPasswordCreationAttributes extends Optional<UserPasswordAttributes, 'id' | 'created_at'> {}

export class UserPassword extends Model<UserPasswordAttributes, UserPasswordCreationAttributes>
  implements UserPasswordAttributes {
  declare id: number;
  declare user_id: number;
  declare password_hash: string;
  declare created_at: Date;
}

UserPassword.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'user_passwords_t', timestamps: false }
);
