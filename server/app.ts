import express from 'express';
import { wallRouter } from './routes/wall';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { Prisma } from './generated/prisma/client';
import { config } from './config';
import { identify } from './middleware/auth';
import { authRouter } from './routes/auth';
import { publicRouter } from './routes/public';
import { milestoneRouter } from './routes/milestones';
import { eventRouter } from './routes/events';
import { adminRouter } from './routes/admin';
import { uploadRouter, uploadDirectory } from './routes/uploads';
export const app = express();
if (config.production) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: config.production
      ? {
          directives: {
            'img-src': ["'self'", 'data:', 'blob:'],
            'script-src': ["'self'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            'upgrade-insecure-requests': null,
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: '64kb' }), cookieParser());
app.use(
  '/api',
  (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      if (
        (origin && !config.origins.includes(origin)) ||
        req.get('sec-fetch-site') === 'cross-site'
      ) {
        res.status(403).json({ message: '请求来源不受信任' });
        return;
      }
    }
    next();
  },
  identify,
);
app.use('/api/auth', authRouter);
app.use('/api/milestones', milestoneRouter);
app.use('/api/events', eventRouter);
app.use('/api/wall', wallRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadRouter);
app.use('/api', publicRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ message: '接口不存在' });
});
app.use('/uploads', express.static(uploadDirectory, { maxAge: '7d', fallthrough: false }));
export const apiErrorHandler: express.ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: error.issues[0]?.message || '请检查填写内容' });
    return;
  }
  if (error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ message: '邮箱或学号已被使用，请检查后重试' });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ message: '邮箱或学号已被使用，请检查后重试' });
    return;
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: '图片不能超过 8 MB' });
    return;
  }
  if (error.status && error.status < 500) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: '服务暂时不可用，请稍后重试' });
};
