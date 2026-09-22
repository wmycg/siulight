import 'dotenv/config';
const origins = (process.env.APP_ORIGINS || process.env.APP_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const allowedOrigins = origins.length ? origins : ['http://localhost:3000'];

export const config = {
  port: Number(process.env.PORT || 3000),
  origin: allowedOrigins[0],
  origins: allowedOrigins,
  production: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL || 'mysql://siulight:siulight_dev@127.0.0.1:3308/siulight',
};
