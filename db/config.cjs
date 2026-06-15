'use strict';

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeders',
  },
};
