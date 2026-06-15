import app from './app.js';
import { connectDB } from './db/sequelize.js';
import { connectRedis } from './cache/redis.js';
import { loadSettings } from './config/appSettings.js';
import { env } from './config/env.js';
import './db/associations.js';

const start = async (): Promise<void> => {
  await connectDB();
  await connectRedis();
  await loadSettings();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
