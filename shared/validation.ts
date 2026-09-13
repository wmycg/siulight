import { z } from 'zod';
import { categories, departments } from './content';
const text = (min: number, max: number) =>
  z.string().trim().min(min, `至少填写 ${min} 个字`).max(max, `最多 ${max} 个字`);
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '请选择日期')
  .refine((value) => {
    const d = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(d.valueOf()) &&
      d.toISOString().slice(0, 10) === value &&
      value >= '1900-01-01' &&
      value <= '2100-12-31'
    );
  }, '日期无效');
export const imageSchema = z
  .string()
  .refine(
    (v) => v === '' || /^\/(images|uploads)\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/.test(v),
    '请上传图片',
  );
export const registerSchema = z.object({
  name: text(2, 20),
  email: z
    .email('邮箱格式不正确')
    .max(190)
    .transform((v) => v.toLowerCase()),
  password: z.string().min(10, '密码至少 10 位').max(128),
});
export const loginSchema = registerSchema.pick({ email: true, password: true });
export const milestoneSchema = z.object({
  title: text(2, 80),
  body: text(5, 3000),
  date: dateSchema.refine(
    (v) => v <= new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }),
    '纪念日期不能晚于今天',
  ),
  kind: z.enum(['personal', 'club']),
  category: z.enum(categories),
  image: imageSchema.default(''),
  participantIds: z.array(z.string().uuid()).max(12).default([]),
});
export const eventSchema = z.object({
  title: text(2, 80),
  date: dateSchema,
  place: text(2, 100),
  brief: text(5, 160),
  body: text(5, 5000),
  image: imageSchema.default(''),
  category: z.enum(categories),
  capacity: z.coerce.number().int().min(1).max(10000),
});
export const applicationSchema = z.object({
  nickname: text(1, 20),
  realName: text(1, 30),
  studentId: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{4,25}$/, '学号需为 4–25 位字母或数字'),
  qq: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{4,14}$/, '请填写正确的 QQ 号码'),
  department: z.string().refine((v) => departments.some((d) => d.id === v), '请选择部门'),
  note: text(0, 500).default(''),
});
export const passwordSchema = z.object({
  currentPassword: z.string().max(128),
  newPassword: z.string().min(10, '新密码至少 10 位').max(128),
});
