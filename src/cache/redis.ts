import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let redisClient: Redis | null = null;

export const connectRedis = (): Promise<void> =>
  new Promise((resolve) => {
    const client = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });

    const timeout = setTimeout(() => {
      client.disconnect();
      console.warn('Redis unavailable — continuing without cache');
      resolve();
    }, env.REDIS_CONNECT_TIMEOUT_MS);

    client
      .connect()
      .then(() => {
        clearTimeout(timeout);
        redisClient = client;
        console.log('Redis connected');
        resolve();
      })
      .catch(() => {
        clearTimeout(timeout);
        console.warn('Redis unavailable — continuing without cache');
        resolve();
      });
  });

export { redisClient };
