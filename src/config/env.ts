import 'dotenv/config';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  PORT: parseInt(optional('PORT', '3000'), 10),
  NODE_ENV: optional('NODE_ENV', 'development'),

  DB_HOST: required('DB_HOST'),
  DB_PORT: parseInt(optional('DB_PORT', '3306'), 10),
  DB_NAME: required('DB_NAME'),
  DB_USER: required('DB_USER'),
  DB_PASSWORD: optional('DB_PASSWORD', ''),

  REDIS_HOST: optional('REDIS_HOST', '127.0.0.1'),
  REDIS_PORT: parseInt(optional('REDIS_PORT', '6379'), 10),
  REDIS_CONNECT_TIMEOUT_MS: parseInt(optional('REDIS_CONNECT_TIMEOUT_MS', '3000'), 10),
  REDIS_USERNAME: optional('REDIS_USERNAME', ''),
  REDIS_PASSWORD: optional('REDIS_PASSWORD', ''),

  RATE_LIMIT_WINDOW_MS: parseInt(required('RATE_LIMIT_WINDOW_MS'), 10),
  RATE_LIMIT_MAX_PUBLIC: parseInt(required('RATE_LIMIT_MAX_PUBLIC'), 10),
  RATE_LIMIT_MAX_PROTECTED: parseInt(required('RATE_LIMIT_MAX_PROTECTED'), 10),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),
};
