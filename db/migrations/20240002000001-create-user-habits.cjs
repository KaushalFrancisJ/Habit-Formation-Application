'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_habits_t', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users_t', key: 'id' },
        onDelete: 'CASCADE',
      },
      habit_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'habits_t', key: 'id' },
        onDelete: 'CASCADE',
      },
      frequency_type: {
        type: Sequelize.ENUM('DAILY', 'WEEKLY'),
        allowNull: false,
      },
      target_frequency: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      grace_period_hours: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        comment: 'Overrides global grace period setting if set',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      current_streak_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      longest_streak_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      paused_at: { type: Sequelize.DATE, allowNull: true },
      archived_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_habits_t', ['user_id', 'status']);
    await queryInterface.addIndex('user_habits_t', ['user_id', 'habit_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_habits_t');
  },
};
