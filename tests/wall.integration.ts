import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomUUID, randomBytes } from 'node:crypto';
import { app, apiErrorHandler } from '../server/app';
import { pool, rows, run } from '../server/db/client';
import { tokenHash } from '../server/middleware/auth';

app.use(apiErrorHandler);
test('Message wall: guest identity, members, pagination and moderation persist in MySQL', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/wall`;
  const marker = `wall-test-${randomUUID()}`;
  const users: string[] = [];
  const ids: number[] = [];
  let guestCookie = '';
  async function request(method = 'GET', data?: unknown, cookie = '', path = '', origin?: string) {
    const response = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
        ...(origin ? { Origin: origin } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    return {
      status: response.status,
      body: await response.json(),
      cookie: response.headers.get('set-cookie'),
    };
  }
  async function session(role: 'member' | 'admin') {
    const id = randomUUID();
    users.push(id);
    await run('INSERT INTO users (id,email,name,passwordHash,role) VALUES (?,?,?,?,?)', [
      id,
      `${id}@test.local`,
      '登录的同好',
      'test-only',
      role,
    ]);
    const token = randomBytes(32).toString('hex');
    await run(
      'INSERT INTO sessions (tokenHash,userId,expiresAt) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))',
      [tokenHash(token), id],
    );
    return `session=${token}`;
  }
  try {
    const member = await session('member'),
      admin = await session('admin');
    await t.test(
      'guest posts plain text; private identity stays private; browser owner can retrieve it',
      async () => {
        const result = await request('POST', {
          body: `${marker} <script>alert(1)</script>`,
          nickname: '访客',
          color: 'rose',
        });
        assert.equal(result.status, 201);
        ids.push(result.body.id);
        assert.match(result.cookie!, /HttpOnly/);
        assert.match(result.cookie!, /SameSite=Lax/);
        guestCookie = result.cookie!.split(';')[0];
        assert.equal(result.body.canDelete, true);
        assert.equal(result.body.registered, false);
        assert.equal(result.body.body, `${marker} <script>alert(1)</script>`);
        assert.equal('guestHash' in result.body, false);
        assert.equal('userId' in result.body, false);
        assert.ok(Number.isFinite(new Date(result.body.createdAt).valueOf()));
        const publicRead = await request();
        assert.equal(publicRead.body.items.find((n: any) => n.id === ids[0]).canDelete, false);
        const ownedRead = await request('GET', undefined, guestCookie);
        assert.equal(ownedRead.body.items.find((n: any) => n.id === ids[0]).canDelete, true);
        const [stored] = await rows<{ guestHash: string; body: string }>(
          'SELECT guestHash,body FROM wall_notes WHERE id=?',
          [ids[0]],
        );
        assert.equal(stored.body, result.body.body);
        assert.equal(stored.guestHash, tokenHash(guestCookie.split('=')[1]));
      },
    );
    await t.test(
      'server determines member name; unauthorised deletion is blocked; owner can delete',
      async () => {
        const result = await request(
          'POST',
          { body: marker, nickname: '伪造管理员', color: 'sage', userId: users[1], isDemo: true },
          member,
        );
        assert.equal(result.status, 201);
        ids.push(result.body.id);
        assert.equal(result.body.nickname, '登录的同好');
        assert.equal(result.body.registered, true);
        assert.equal(result.body.isDemo, false);
        assert.equal((await request('DELETE', undefined, '', `/${ids[0]}`)).status, 403);
        assert.equal((await request('DELETE', undefined, member, `/${ids[0]}`)).status, 403);
        assert.equal(
          (await request('DELETE', undefined, guestCookie, `/${result.body.id}`)).status,
          403,
        );
        assert.equal(
          (await request('DELETE', undefined, member, `/${result.body.id}`)).status,
          200,
        );
        assert.equal(
          (await request('DELETE', undefined, member, `/${result.body.id}`)).status,
          404,
        );
      },
    );
    await t.test(
      'rejects empty, oversized, invalid-color and cross-origin submissions',
      async () => {
        for (const data of [
          { body: '  ' },
          { body: 'x'.repeat(281) },
          { body: 'hi', color: '<script>' },
          { body: 'hi', nickname: 'x'.repeat(21) },
        ])
          assert.equal((await request('POST', data)).status, 400);
        assert.equal(
          (await request('POST', { body: 'hi' }, '', '', 'https://other.invalid')).status,
          403,
        );
        assert.equal((await request('GET', undefined, '', '?cursor=bad')).status, 400);
      },
    );
    await t.test(
      'cursor pagination does not repeat notes, and a new insertion does not shift old pages',
      async () => {
        for (let i = 0; i < 65; i++) {
          const r = await run('INSERT INTO wall_notes (body,nickname,color) VALUES (?,?,?)', [
            marker,
            '分页测试',
            'sky',
          ]);
          ids.push(r.insertId);
        }
        const first = (await request()).body;
        assert.equal(first.items.length, 60);
        assert.ok(first.nextCursor);
        const latest = await request('POST', { body: marker }, guestCookie);
        ids.push(latest.body.id);
        assert.equal(
          latest.body.color,
          'random',
          'Omitted colour defaults to automatic display colour',
        );
        const second = (await request('GET', undefined, '', `?cursor=${first.nextCursor}`)).body;
        assert.ok(second.items.length >= 6);
        const seen = new Set(first.items.map((n: any) => n.id));
        for (const n of second.items) {
          assert.ok(!seen.has(n.id));
          assert.ok(n.id < first.nextCursor);
        }
      },
    );
    await t.test('guest can retract own note and admin can moderate others', async () => {
      assert.equal((await request('DELETE', undefined, guestCookie, `/${ids[0]}`)).status, 200);
      assert.equal((await request('DELETE', undefined, admin, `/${ids.at(-1)}`)).status, 200);
    });
  } finally {
    for (const id of ids) await run('DELETE FROM wall_notes WHERE id=?', [id]);
    for (const id of users) await run('DELETE FROM users WHERE id=?', [id]);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await pool.end();
  }
});
