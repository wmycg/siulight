import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { app, apiErrorHandler } from '../server/app';
import { pool, rows, run } from '../server/db/client';
import { hashPassword } from '../server/services/password';
import type { Page, Milestone, User, Member } from '../shared/types';
app.use(apiErrorHandler);
test('MySQL full-stack workflows, persistence, permissions and atomic writes', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/api`;
  const suffix = randomUUID().slice(0, 8);
  const password = 'Integration-Test-2026!';
  const createdUsers: string[] = [];
  const createdMemories: string[] = [];
  const createdEvents: string[] = [];
  const createdApplications: string[] = [];
  const uploads: string[] = [];
  const cookies: Record<string, string> = {};
  async function request<T = any>(
    route: string,
    method = 'GET',
    data?: unknown,
    who?: string,
    extraHeaders: Record<string, string> = {},
  ) {
    const response = await fetch(`${base}${route}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(who && cookies[who] ? { Cookie: cookies[who] } : {}),
        ...extraHeaders,
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
    const cookie = response.headers.get('set-cookie');
    if (cookie && who) cookies[who] = cookie.split(';')[0];
    return { status: response.status, data: (await response.json()) as T, cookie };
  }
  const adminId = randomUUID();
  createdUsers.push(adminId);
  await run('INSERT INTO users (id,email,name,passwordHash,role) VALUES (?,?,?,?,?)', [
    adminId,
    `admin-${suffix}@test.local`,
    `测试管理${suffix}`,
    await hashPassword(password),
    'superadmin',
  ]);
  let alice: User;
  let bob: User;
  let memoryId: string;
  let eventId: string;
  try {
    await t.test('health proves a real MySQL connection', async () => {
      const r = await request('/health');
      assert.equal(r.status, 200);
      assert.equal(r.data.database, 'mysql');
      const [row] = await rows<{ engine: string }>('SELECT VERSION() engine');
      assert.match(row.engine, /^8\./);
    });
    await t.test('registration creates persistent users and HttpOnly sessions', async () => {
      const a = await request<User>(
        '/auth/register',
        'POST',
        { name: '测试小夏', email: `alice-${suffix}@test.local`, password },
        'alice',
      );
      assert.equal(a.status, 201);
      assert.match(a.cookie!, /HttpOnly/);
      alice = a.data;
      createdUsers.push(alice.id);
      const b = await request<User>(
        '/auth/register',
        'POST',
        { name: '测试伙伴', email: `bob-${suffix}@test.local`, password },
        'bob',
      );
      assert.equal(b.status, 201);
      bob = b.data;
      createdUsers.push(bob.id);
      assert.equal((await request('/auth/me', 'GET', undefined, 'alice')).data.id, alice.id);
      const [stored] = await rows<{ passwordHash: string }>(
        'SELECT passwordHash FROM users WHERE id=?',
        [alice.id],
      );
      assert.notEqual(stored.passwordHash, password);
      assert.equal(
        (
          await request('/auth/register', 'POST', {
            name: '重复用户',
            email: alice.email,
            password,
          })
        ).status,
        409,
      );
    });
    const content = () => ({
      title: `测试共同纪念-${suffix}`,
      body: '这是两个人共同完成的里程碑。用于数据库集成验证。',
      date: '2026-01-01',
      kind: 'personal',
      category: '日常',
      image: '',
      participantIds: [bob.id],
    });
    await t.test('anonymous writes, admin access and cross-origin writes are denied', async () => {
      assert.equal((await request('/milestones', 'POST', content())).status, 401);
      assert.equal((await request('/admin/applications', 'GET', undefined, 'alice')).status, 403);
      assert.equal(
        (
          await request('/milestones', 'POST', content(), 'alice', {
            Origin: 'https://untrusted.example',
          })
        ).status,
        403,
      );
      assert.equal(
        (await request('/milestones', 'POST', { ...content(), kind: 'club' }, 'alice')).status,
        403,
      );
    });
    await t.test(
      'multi-person memory persists and is visible in each participant album',
      async () => {
        const r = await request('/milestones', 'POST', content(), 'alice');
        assert.equal(r.status, 201);
        memoryId = r.data.id;
        createdMemories.push(memoryId);
        const [stored] = await rows<{ title: string }>('SELECT title FROM milestones WHERE id=?', [
          memoryId,
        ]);
        assert.equal(stored.title, content().title);
        const publicList = await request<Page<Milestone>>(`/milestones?author=${bob.id}`);
        const memory = publicList.data.items.find((m) => m.id === memoryId)!;
        assert.equal(memory.participants.length, 2);
        assert.equal(memory.authorId, alice.id);
        assert.equal('email' in memory.author, false);
        assert.equal('passwordHash' in memory.author, false);
      },
    );
    await t.test(
      'another participant cannot edit/delete author content; invalid participant rolls back',
      async () => {
        assert.equal(
          (await request(`/milestones/${memoryId}`, 'PUT', content(), 'bob')).status,
          403,
        );
        assert.equal(
          (await request(`/milestones/${memoryId}`, 'DELETE', undefined, 'bob')).status,
          403,
        );
        assert.equal(
          (
            await request(
              '/milestones',
              'POST',
              { ...content(), title: 'invalid-participant', participantIds: [randomUUID()] },
              'alice',
            )
          ).status,
          400,
        );
        const bad = await rows('SELECT id FROM milestones WHERE title=?', ['invalid-participant']);
        assert.equal(bad.length, 0);
      },
    );
    await t.test('likes are idempotent and persist across reads', async () => {
      await request(`/milestones/${memoryId}/like`, 'PUT', { liked: true }, 'bob');
      await request(`/milestones/${memoryId}/like`, 'PUT', { liked: true }, 'bob');
      let r = await request<Page<Milestone>>(
        `/milestones?author=${alice.id}`,
        'GET',
        undefined,
        'bob',
      );
      let m = r.data.items.find((m) => m.id === memoryId)!;
      assert.equal(m.likes, 1);
      assert.equal(m.liked, true);
      await request(`/milestones/${memoryId}/like`, 'PUT', { liked: false }, 'bob');
      r = await request(`/milestones?author=${alice.id}`);
      assert.equal(r.data.items.find((m) => m.id === memoryId)!.likes, 0);
    });
    await t.test('author edits become visible and date validation is enforced', async () => {
      const r = await request(
        `/milestones/${memoryId}`,
        'PUT',
        { ...content(), title: `测试已修改-${suffix}`, participantIds: [] },
        'alice',
      );
      assert.equal(r.status, 200);
      const list = await request<Page<Milestone>>(`/milestones?q=${suffix}`);
      assert.equal(list.data.items.find((m) => m.id === memoryId)!.title, `测试已修改-${suffix}`);
      assert.equal(list.data.items.find((m) => m.id === memoryId)!.participants.length, 1);
      assert.equal(
        (await request('/milestones', 'POST', { ...content(), date: '2026-02-30' }, 'alice'))
          .status,
        400,
      );
      assert.equal(
        (await request('/milestones', 'POST', { ...content(), date: '2099-01-01' }, 'alice'))
          .status,
        400,
      );
    });
    await t.test(
      'image upload decodes and re-encodes pixels; invalid files are rejected',
      async () => {
        const bytes = await sharp({
          create: { width: 10, height: 10, channels: 3, background: '#c26a51' },
        })
          .png()
          .toBuffer();
        const form = new FormData();
        form.append('image', new Blob([new Uint8Array(bytes)], { type: 'image/png' }), 'test.png');
        const r = await fetch(`${base}/uploads`, {
          method: 'POST',
          headers: { Cookie: cookies.alice },
          body: form,
        });
        assert.equal(r.status, 201);
        const data = (await r.json()) as { url: string };
        uploads.push(data.url);
        assert.match(data.url, /^\/uploads\/[a-f0-9-]+\.webp$/);
        const image = await fetch(`http://127.0.0.1:${address.port}${data.url}`);
        assert.equal(image.status, 200);
        assert.match(image.headers.get('content-type')!, /image\/webp/);
        const invalid = new FormData();
        invalid.append(
          'image',
          new Blob(['<script>bad</script>'], { type: 'image/png' }),
          'bad.png',
        );
        assert.equal(
          (
            await fetch(`${base}/uploads`, {
              method: 'POST',
              headers: { Cookie: cookies.alice },
              body: invalid,
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      'application creates a private receipt and prevents duplicate student IDs',
      async () => {
        const d = {
          nickname: '测试报名',
          realName: '测试姓名',
          studentId: `T${suffix}`,
          qq: '123456789',
          department: 'media',
          note: '用于集成验证',
        };
        const r = await request('/applications', 'POST', d);
        assert.equal(r.status, 201);
        createdApplications.push(r.data.id);
        assert.deepEqual(Object.keys(r.data), ['id']);
        assert.equal((await request('/applications', 'POST', d)).status, 409);
        assert.equal((await request('/admin/applications')).status, 403);
      },
    );
    await t.test(
      'admin can create activities, process applications and audit actions',
      async () => {
        assert.equal(
          (
            await request(
              '/auth/login',
              'POST',
              { email: `admin-${suffix}@test.local`, password },
              'admin',
            )
          ).status,
          200,
        );
        const e = {
          title: `测试活动-${suffix}`,
          date: '2099-01-01',
          place: '测试集合点',
          brief: '一次数据库集成测试活动。',
          body: '测试活动说明，请勿参与。',
          image: '',
          category: '社团',
          capacity: 1,
        };
        const r = await request('/admin/events', 'POST', e, 'admin');
        assert.equal(r.status, 201);
        eventId = r.data.id;
        createdEvents.push(eventId);
        const apps = await request('/admin/applications', 'GET', undefined, 'admin');
        assert.ok(apps.data.items.some((a: any) => a.id === createdApplications[0]));
        assert.equal(
          (
            await request(
              `/admin/applications/${createdApplications[0]}`,
              'PATCH',
              { status: 'accepted' },
              'admin',
            )
          ).status,
          200,
        );
        const [stored] = await rows<{ status: string }>(
          'SELECT status FROM applications WHERE id=?',
          [createdApplications[0]],
        );
        assert.equal(stored.status, 'accepted');
        assert.ok(
          (await request('/admin/logs', 'GET', undefined, 'admin')).data.items.some((l: any) =>
            l.action.includes(suffix),
          ),
        );
      },
    );
    await t.test(
      'capacity is enforced under concurrent joins, cancellation frees the slot',
      async () => {
        const results = await Promise.all([
          request(`/events/${eventId}/join`, 'PUT', { joined: true }, 'alice'),
          request(`/events/${eventId}/join`, 'PUT', { joined: true }, 'bob'),
        ]);
        assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
        const [count] = await rows<{ total: number }>(
          'SELECT COUNT(*) total FROM event_attendees WHERE eventId=?',
          [eventId],
        );
        assert.equal(count.total, 1);
        const winner = results[0].status === 200 ? 'alice' : 'bob';
        const loser = winner === 'alice' ? 'bob' : 'alice';
        await request(`/events/${eventId}/join`, 'PUT', { joined: false }, winner);
        assert.equal(
          (await request(`/events/${eventId}/join`, 'PUT', { joined: true }, loser)).status,
          200,
        );
      },
    );
    await t.test(
      'capacity edits respect bookings and malformed pagination is rejected',
      async () => {
        const data = {
          title: `测试活动-${suffix}`,
          date: '2099-01-01',
          place: '测试集合点',
          brief: '一次数据库集成测试活动。',
          body: '测试活动说明，请勿参与。',
          image: '',
          category: '社团',
          capacity: 2,
        };
        assert.equal((await request(`/admin/events/${eventId}`, 'PUT', data, 'admin')).status, 200);
        await request(`/events/${eventId}/join`, 'PUT', { joined: true }, 'alice');
        await request(`/events/${eventId}/join`, 'PUT', { joined: true }, 'bob');
        assert.equal(
          (await request(`/admin/events/${eventId}`, 'PUT', { ...data, capacity: 1 }, 'admin'))
            .status,
          409,
        );
        assert.equal((await request('/milestones?page=1.1')).status, 400);
        assert.equal((await request('/milestones?author=bad-id')).status, 400);
      },
    );
    await t.test(
      'superadmin manages accounts, normal members cannot escalate privileges',
      async () => {
        assert.equal(
          (await request(`/admin/users/${bob.id}`, 'PATCH', { role: 'admin' }, 'alice')).status,
          403,
        );
        assert.equal(
          (await request(`/admin/users/${adminId}`, 'PATCH', { role: 'member' }, 'admin')).status,
          400,
        );
        assert.equal(
          (await request(`/admin/users/${bob.id}`, 'PATCH', { role: 'admin' }, 'admin')).status,
          200,
        );
        assert.equal((await request('/auth/me', 'GET', undefined, 'bob')).data, null);
        assert.equal(
          (await request(`/admin/users/${bob.id}`, 'PATCH', { role: 'member' }, 'admin')).status,
          200,
        );
      },
    );
    await t.test(
      'password change invalidates other sessions, logout invalidates current session',
      async () => {
        await request('/auth/login', 'POST', { email: alice.email, password }, 'other');
        assert.equal(
          (
            await request(
              '/auth/password',
              'POST',
              { currentPassword: password, newPassword: 'Changed-Password-2026!' },
              'alice',
            )
          ).status,
          200,
        );
        assert.equal((await request('/auth/me', 'GET', undefined, 'other')).data, null);
        await request('/auth/logout', 'POST', {}, 'alice');
        assert.equal((await request('/auth/me', 'GET', undefined, 'alice')).data, null);
        assert.equal(
          (await request('/auth/login', 'POST', { email: alice.email, password }, 'alice')).status,
          401,
        );
      },
    );
  } finally {
    for (const id of createdMemories) await run('DELETE FROM milestones WHERE id=?', [id]);
    for (const id of createdEvents) await run('DELETE FROM events WHERE id=?', [id]);
    for (const id of createdApplications) await run('DELETE FROM applications WHERE id=?', [id]);
    for (const id of createdUsers) await run('DELETE FROM users WHERE id=?', [id]);
    await run('DELETE FROM audit_logs WHERE actor=?', [`测试管理${suffix}`]);
    for (const file of uploads) await rm(path.resolve('storage', file.slice(1)), { force: true });
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await pool.end();
  }
});
