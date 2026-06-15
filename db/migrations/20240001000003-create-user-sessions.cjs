'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_sessions_t', {
      session_token: {
        type: Sequelize.STRING(512),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users_t', key: 'id' },
        onDelete: 'CASCADE',
      },
      timezone: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'UTC',
      },
      last_accessed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_sessions_t', ['user_id']);
    await queryInterface.addIndex('user_sessions_t', ['user_id', 'is_active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_sessions_t');
  },
};
