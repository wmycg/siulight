import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { rateLimit } from 'express-rate-limit';
import { authenticated } from '../middleware/auth';
export const uploadDirectory = path.resolve('storage/uploads');
export const uploadRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});
uploadRouter.post(
  '/',
  authenticated,
  rateLimit({ windowMs: 3600000, limit: 30, message: { message: '上传较多，请稍后再试' } }),
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: '请选择图片' });
      return;
    }
    const file = `${randomUUID()}.webp`;
    await mkdir(uploadDirectory, { recursive: true });
    try {
      await sharp(req.file.buffer, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(uploadDirectory, file));
    } catch {
      res.status(400).json({ message: '图片无法读取，请使用 JPG、PNG 或 WebP 图片' });
      return;
    }
    res.status(201).json({ url: `/uploads/${file}` });
  },
);
