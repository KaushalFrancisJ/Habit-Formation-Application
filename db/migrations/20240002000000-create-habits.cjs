'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habits_t', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estimated_duration_minutes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      difficulty_level: {
        type: Sequelize.ENUM('EASY', 'MEDIUM', 'HARD'),
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM('USER', 'SYSTEM'),
        allowNull: false,
        defaultValue: 'USER',
      },
      created_by_user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'users_t', key: 'id' },
        onDelete: 'SET NULL',
      },
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('habits_t', ['created_by_user_id']);
    await queryInterface.addIndex('habits_t', ['deleted_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('habits_t');
  },
};
