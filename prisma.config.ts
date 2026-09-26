import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const noDatabaseCommands = ['generate', 'validate', 'format'];
const databaseUrl =
  process.env.DATABASE_URL ||
  (noDatabaseCommands.some((command) => process.argv.includes(command))
    ? 'mysql://localhost:3306/siulight'
    : undefined);
if (!databaseUrl) throw new Error('DATABASE_URL is required for Prisma database commands');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: databaseUrl,
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
