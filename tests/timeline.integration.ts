import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { app, apiErrorHandler } from '../server/app';
import { prisma, rows, run } from '../server/db/client';
import { saveMilestone } from '../server/services/milestones';
app.use(apiErrorHandler);
test('Timeline groups real events without duplicating participants or losing crowded days', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/milestones`;
  const users = [randomUUID(), randomUUID()],
    event = randomUUID(),
    ids: string[] = [];
  const marker = `timeline-${randomUUID()}`;
  async function get(query: string) {
    const result = await fetch(base + query);
    return { status: result.status, data: await result.json() };
  }
  try {
    for (const [i, id] of users.entries())
      await run('INSERT INTO users (id,email,name,passwordHash) VALUES (?,?,?,?)', [
        id,
        `${id}@test.local`,
        `轴线验证${i}`,
        'test-only',
      ]);
    await run(
      'INSERT INTO events (id,title,date,place,brief,body,category) VALUES (?,?,?,?,?,?,?)',
      [event, marker, '2026-06-10', '测试地点', '演示说明', '演示内容', '社团'],
    );
    for (let i = 0; i < 34; i++) {
      const id = randomUUID();
      ids.push(id);
      await saveMilestone(
        id,
        users[i % 2],
        {
          title: `${marker}-${i}`,
          body: '保存同一场活动中的不同个人回忆',
          date: i < 16 ? '2026-06-10' : i < 33 ? '2026-06-08' : '2025-12-01',
          kind: i === 0 ? 'club' : 'personal',
          category: '日常',
          image: '',
          participantIds: [users[(i + 1) % 2]],
          eventId: i < 16 ? event : '',
        },
        false,
      );
    }
    const chapters = (await get(`/chapters?author=${users[0]}`)).data;
    assert.deepEqual(
      chapters.map((c: any) => [c.month, c.count, c.people]),
      [
        ['2026-06', 33, 2],
        ['2025-12', 1, 2],
      ],
    );
    const timeline = (await get(`/timeline?month=2026-06&author=${users[0]}`)).data;
    assert.equal(timeline.total, 2);
    const story = timeline.items.find((g: any) => g.type === 'event'),
      day = timeline.items.find((g: any) => g.type === 'day');
    assert.equal(story.count, 16);
    assert.equal(story.people, 2);
    assert.equal(story.preview.length, 3);
    assert.equal(story.eventId, event);
    assert.equal(day.count, 17);
    assert.equal(day.preview.length, 3);
    const first = (await get(`?month=2026-06&eventId=${event}&page=1`)).data;
    const second = (await get(`?month=2026-06&eventId=${event}&page=2`)).data;
    assert.equal(first.items.length, 12);
    assert.equal(second.items.length, 4);
    assert.equal(new Set([...first.items, ...second.items].map((m: any) => m.id)).size, 16);
    const independent = (
      await get(`?month=2026-06&date=2026-06-08&unlinked=true&author=${users[0]}`)
    ).data;
    assert.equal(independent.total, 17);
    assert.ok(independent.items.every((m: any) => !m.eventId));
    assert.equal((await get(`/chapters?author=${users[0]}&kind=club`)).data[0].count, 1);
    assert.equal((await get(`/chapters?author=${users[0]}&year=2025`)).data.length, 1);
    assert.equal((await get(`/chapters?q=${encodeURIComponent('轴线验证')}`)).data[0].count, 33);
    for (const query of [
      '/timeline',
      '/timeline?month=2026-13',
      '/chapters?author=bad',
      '?eventId=bad',
      '?date=2026-02-30',
      '/timeline?month=2026-06&page=1.2',
    ])
      assert.equal((await get(query)).status, 400);
    await assert.rejects(
      saveMilestone(
        randomUUID(),
        users[0],
        {
          title: '不存在的活动',
          body: '测试无效关联应回滚',
          date: '2026-01-01',
          kind: 'personal',
          category: '日常',
          image: '',
          participantIds: [],
          eventId: randomUUID(),
        },
        false,
      ),
      /活动已不存在/,
    );
    // Deleting an event unlinks stories rather than deleting people's memories.
    await run('DELETE FROM events WHERE id=?', [event]);
    const [remaining] = await rows<{ total: number }>(
      'SELECT COUNT(*) total FROM milestones WHERE authorId IN (?,?)',
      users,
    );
    assert.equal(remaining.total, 34);
    assert.equal(
      (await get(`/timeline?month=2026-06&author=${users[0]}`)).data.items.every(
        (g: any) => g.type === 'day',
      ),
      true,
    );
  } finally {
    for (const id of ids) await run('DELETE FROM milestones WHERE id=?', [id]);
    await run('DELETE FROM events WHERE id=?', [event]);
    for (const id of users) await run('DELETE FROM users WHERE id=?', [id]);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect();
  }
});
