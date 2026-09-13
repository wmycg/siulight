import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT || 3000),
  origin: process.env.APP_ORIGIN || 'http://localhost:3000',
  production: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL || 'mysql://siulight:siulight_dev@127.0.0.1:3308/siulight',
};
