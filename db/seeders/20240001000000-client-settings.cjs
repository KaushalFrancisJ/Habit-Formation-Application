'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('client_settings_t', [
      {
        setting_key: 'session_idle_timeout_ms',
        setting_value: '1800000',
        description: 'Session idle expiry in milliseconds (default: 30 min)',
        updated_at: new Date(),
      },
      {
        setting_key: 'max_concurrent_sessions',
        setting_value: '3',
        description: 'Maximum number of active sessions allowed per user',
        updated_at: new Date(),
      },
      {
        setting_key: 'grace_period_daily_hours',
        setting_value: '4',
        description: 'Grace period in hours for daily habits',
        updated_at: new Date(),
      },
      {
        setting_key: 'grace_period_weekly_hours',
        setting_value: '48',
        description: 'Grace period in hours for weekly habits (end-of-week buffer)',
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('client_settings_t', {
      setting_key: [
        'session_idle_timeout_ms',
        'max_concurrent_sessions',
        'grace_period_daily_hours',
        'grace_period_weekly_hours',
      ],
    });
  },
};
