import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cp, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import mysql from 'mysql2/promise';

const exec = promisify(execFile);
const require = createRequire(import.meta.url);
const root = process.cwd();
const cli = path.join(root, 'node_modules/prisma/build/index.js');

test(
  'Prisma: fresh install, incremental upgrade, repeat deployment and failure gate',
  { timeout: 120_000 },
  async () => {
    const database = `siulight_migration_test_${randomUUID().replaceAll('-', '')}`;
    const url = new URL(process.env.DATABASE_URL!);
    assert.ok(
      ['localhost', '127.0.0.1'].includes(url.hostname),
      'Only the local Docker database can run this test',
    );
    const username = decodeURIComponent(url.username);
    assert.match(username, /^[a-zA-Z0-9_]+$/);
    url.pathname = `/${database}`;
    const directory = await mkdtemp(path.join(tmpdir(), 'siulight-prisma-'));
    const env = {
      ...process.env,
      DATABASE_URL: url.href,
      SHADOW_DATABASE_URL: '',
      PRISMA_HIDE_UPDATE_MESSAGE: '1',
    };
    async function rootSql(sql: string) {
      // No password is copied out of the local container or printed by the test.
      await exec(
        'docker',
        [
          'compose',
          'exec',
          '-T',
          'mysql',
          'sh',
          '-c',
          'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "$1"',
          'mysql',
          sql,
        ],
        { cwd: root },
      );
    }
    const config = path.join(directory, 'prisma.config.ts');
    async function prisma(...args: string[]) {
      return exec(process.execPath, [cli, ...args, '--config', config], {
        cwd: root,
        env,
        timeout: 30_000,
      });
    }
    let connection: mysql.Connection | undefined;
    try {
      await rootSql(
        `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL ON \`${database}\`.* TO '${username}'@'%';`,
      );
      await cp('prisma/migrations', path.join(directory, 'migrations'), { recursive: true });
      await cp('prisma/schema.prisma', path.join(directory, 'schema.prisma'));
      await writeFile(
        config,
        `import { defineConfig } from ${JSON.stringify(require.resolve('prisma/config'))};\nexport default defineConfig({schema:'./schema.prisma',migrations:{path:'./migrations'},datasource:{url:process.env.DATABASE_URL}});\n`,
      );
      await prisma('migrate', 'deploy');
      connection = await mysql.createConnection(url.href);
      const [baseline] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL',
      );
      const id = randomUUID();
      await connection.execute('INSERT INTO users (id,email,name,passwordHash) VALUES (?,?,?,?)', [
        id,
        'migration@test.local',
        '迁移测试',
        'not-a-login-hash',
      ]);
      const next = path.join(directory, 'migrations/20260914000000_add_probe');
      await mkdir(next);
      await writeFile(
        path.join(next, 'migration.sql'),
        "ALTER TABLE users ADD COLUMN migrationProbe VARCHAR(30) NOT NULL DEFAULT 'retained';",
      );
      await prisma('migrate', 'deploy');
      await prisma('migrate', 'deploy');
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT name,migrationProbe FROM users WHERE id=?',
        [id],
      );
      assert.equal(rows[0].name, '迁移测试');
      assert.equal(rows[0].migrationProbe, 'retained');
      const [history] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL',
      );
      assert.equal(
        history.length,
        baseline.length + 1,
        'Repeat deployment must not apply migrations twice',
      );
      const broken = path.join(directory, 'migrations/20260915000000_fail');
      await mkdir(broken);
      await writeFile(
        path.join(broken, 'migration.sql'),
        'ALTER TABLE missing_migration_test_table ADD COLUMN broken INT;',
      );
      await assert.rejects(prisma('migrate', 'deploy'));
      await assert.rejects(prisma('migrate', 'deploy'));
      // Test the actual production entry command, not a copy of its && behavior.
      await assert.rejects(
        exec('pnpm', ['start'], { cwd: root, env, timeout: 20_000 }),
        (error: unknown) => {
          const failure = error as { code?: number; killed?: boolean; stdout?: string };
          assert.equal(
            failure.killed,
            false,
            'Startup must fail promptly, not hang running a server',
          );
          assert.ok(failure.code && failure.code !== 0);
          assert.ok(
            !failure.stdout?.includes('微光漫摄 →'),
            'Server must not start after a failed migration',
          );
          return true;
        },
      );
    } finally {
      await connection?.end();
      await rootSql(
        `REVOKE ALL PRIVILEGES ON \`${database}\`.* FROM '${username}'@'%'; DROP DATABASE IF EXISTS \`${database}\`;`,
      );
      await rm(directory, { recursive: true, force: true });
    }
  },
);
