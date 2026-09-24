import 'dotenv/config';
const production = process.env.NODE_ENV === 'production';
const configuredOrigins = process.env.APP_ORIGINS || process.env.APP_ORIGIN;
if (production && !configuredOrigins?.trim()) {
  throw new Error('APP_ORIGIN or APP_ORIGINS is required in production');
}
const origins = (configuredOrigins || 'http://localhost:3000')
  .split(',')
  .map((value) => value.trim().replace(/\/+$/, ''))
  .filter(Boolean);
const allowedOrigins = origins.length ? origins : ['http://localhost:3000'];
if (production) {
  for (const origin of allowedOrigins) {
    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new Error(`Invalid APP_ORIGIN: ${origin}`);
    }
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new Error(`Invalid APP_ORIGIN: ${origin}`);
    }
  }
}
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}
const databaseUrl = process.env.DATABASE_URL?.trim();
if (production && !databaseUrl) {
  throw new Error('DATABASE_URL is required in production');
}

export const config = {
  port,
  origin: allowedOrigins[0],
  origins: allowedOrigins,
  production,
  databaseUrl: databaseUrl || 'mysql://siulight:siulight_dev@127.0.0.1:3308/siulight',
};
