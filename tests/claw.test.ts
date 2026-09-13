import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClaw, grab, prizes, tickClaw } from '../src/features/wall/claw-engine';
import type { WallNote } from '../shared/types';
const notes: WallNote[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  body: '纸条',
  nickname: '同好',
  color: 'butter',
  registered: false,
  isDemo: false,
  canDelete: false,
  createdAt: '2026-01-01T00:00:00Z',
}));
test('Claw catches a real note only when aligned; next round offers different notes', () => {
  const s = createClaw();
  const target = prizes(notes, 0)[2];
  s.x = target.x;
  grab(s);
  tickClaw(s, 680, notes);
  assert.equal(s.caught?.id, target.note.id);
  assert.equal(s.phase, 'lifting');
  tickClaw(s, 860, notes);
  assert.equal(s.phase, 'delivered');
  assert.equal(s.y, 90);
  assert.notEqual(prizes(notes, 1)[2].note.id, target.note.id);
});
test('A miss stays a miss, rapid grab cannot restart animation, aiming has bounds', () => {
  const s = createClaw();
  s.direction = 1;
  tickClaw(s, 5000, notes);
  assert.equal(s.x, 612);
  s.direction = -1;
  tickClaw(s, 5000, notes);
  assert.equal(s.x, 68);
  s.x = 123;
  grab(s);
  tickClaw(s, 300, notes);
  grab(s);
  assert.equal(s.elapsed, 300);
  tickClaw(s, 380, notes);
  tickClaw(s, 860, notes);
  assert.equal(s.phase, 'missed');
  assert.equal(s.caught, null);
  assert.equal(prizes([], 0).length, 0);
});
