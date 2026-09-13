import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dateSchema,
  milestoneSchema,
  applicationSchema,
  registerSchema,
  imageSchema,
} from '../shared/validation';
import { hashPassword, verifyPassword } from '../server/services/password';
test('calendar validation rejects impossible and out-of-range dates', () => {
  assert.equal(dateSchema.safeParse('2026-02-30').success, false);
  assert.equal(dateSchema.safeParse('2024-02-29').success, true);
  assert.equal(dateSchema.safeParse('1899-12-31').success, false);
});
test('milestones reject future memories, unsafe image paths and excessive participants', () => {
  const valid = {
    title: '一个新起点',
    body: '记录一个值得记住的小小瞬间。',
    date: '2026-01-01',
    kind: 'personal',
    category: '日常',
  };
  assert.equal(milestoneSchema.safeParse(valid).success, true);
  assert.equal(milestoneSchema.safeParse({ ...valid, date: '2099-01-01' }).success, false);
  assert.equal(imageSchema.safeParse('javascript:alert(1)').success, false);
  assert.equal(imageSchema.safeParse('/uploads/../../.env').success, false);
  assert.equal(imageSchema.safeParse('/uploads/test.webp').success, true);
  assert.equal(
    milestoneSchema.safeParse({
      ...valid,
      participantIds: Array(13).fill('00000000-0000-4000-8000-000000000001'),
    }).success,
    false,
  );
});
test('membership application validates private fields and department', () => {
  const valid = {
    nickname: '测试',
    realName: '测试同学',
    studentId: '202612345',
    qq: '123456789',
    department: 'media',
    note: '',
  };
  assert.equal(applicationSchema.safeParse(valid).success, true);
  assert.equal(applicationSchema.safeParse({ ...valid, department: 'invented' }).success, false);
  assert.equal(applicationSchema.safeParse({ ...valid, qq: '123' }).success, false);
});
test('registration normalizes email and enforces password length', () => {
  assert.equal(
    registerSchema.parse({ name: '小夏', email: 'Test@Example.com', password: 'LongEnough123!' })
      .email,
    'test@example.com',
  );
  assert.equal(
    registerSchema.safeParse({ name: '小夏', email: 'a@b.com', password: '123' }).success,
    false,
  );
});
test('passwords use salted non-reversible hashes with constant-time comparison', async () => {
  const a = await hashPassword('LongEnough123!');
  const b = await hashPassword('LongEnough123!');
  assert.notEqual(a, b);
  assert.equal(await verifyPassword('LongEnough123!', a), true);
  assert.equal(await verifyPassword('wrong', a), false);
  assert.equal(await verifyPassword('anything', 'bad'), false);
});
