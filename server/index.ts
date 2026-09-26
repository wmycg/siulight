import path from 'node:path';
import { readFile } from 'node:fs/promises';
import express from 'express';
import { app, apiErrorHandler } from './app';
import { config } from './config';
import { closeDatabase } from './db/client';
if (config.production) {
  app.use(express.static(path.resolve('dist/client')));
  app.get('/{*path}', (_req, res) => res.sendFile(path.resolve('dist/client/index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  app.use(vite.middlewares);
  app.get('/{*path}', async (req, res, next) => {
    try {
      const html = await readFile(path.resolve('index.html'), 'utf8');
      res.type('html').send(await vite.transformIndexHtml(req.originalUrl, html));
    } catch (error) {
      next(error);
    }
  });
}
app.use(apiErrorHandler);
const server = app.listen(config.port, '0.0.0.0', () => console.log(`微光漫摄 → ${config.origin}`));
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
