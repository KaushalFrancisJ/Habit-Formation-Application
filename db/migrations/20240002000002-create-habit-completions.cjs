'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habit_completion_t', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_habit_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'user_habits_t', key: 'id' },
        onDelete: 'CASCADE',
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      completion_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Logical habit date derived server-side from completed_at + session timezone',
      },
      duration_minutes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      completion_source: {
        type: Sequelize.ENUM('MANUAL', 'SYSTEM'),
        allowNull: false,
        defaultValue: 'MANUAL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('habit_completion_t', ['user_habit_id', 'completion_date']);
    await queryInterface.addIndex('habit_completion_t', ['user_habit_id', 'completed_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('habit_completion_t');
  },
};
