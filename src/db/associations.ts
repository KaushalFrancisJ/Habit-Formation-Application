import { User } from './models/User.js';
import { UserPassword } from './models/UserPassword.js';
import { UserSession } from './models/UserSession.js';
import { Habit } from './models/Habit.js';
import { UserHabit } from './models/UserHabit.js';
import { HabitCompletion } from './models/HabitCompletion.js';

User.hasMany(UserPassword, { foreignKey: 'user_id' });
UserPassword.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserHabit, { foreignKey: 'user_id' });
UserHabit.belongsTo(User, { foreignKey: 'user_id' });

Habit.hasMany(UserHabit, { foreignKey: 'habit_id' });
UserHabit.belongsTo(Habit, { foreignKey: 'habit_id', as: 'habit_t' });

UserHabit.hasMany(HabitCompletion, { foreignKey: 'user_habit_id', as: 'completions' });
HabitCompletion.belongsTo(UserHabit, { foreignKey: 'user_habit_id', as: 'userHabit' });
