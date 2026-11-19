import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverMembers, loadMemberRouters } from './member-registry.js';
import { getLabContext } from './supabase.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function createApp({ rootDirectory = ROOT } = {}) {
  const app = express();
  const members = await discoverMembers(rootDirectory);
  const routers = await loadMemberRouters(members, rootDirectory, getLabContext());

  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.get('/', (_req, res) => res.sendFile(path.join(rootDirectory, 'index.html')));
  app.use('/assets', express.static(path.join(rootDirectory, 'assets'), {
    dotfiles: 'deny', index: false, fallthrough: true,
  }));
  app.use('/simulation', express.static(path.join(rootDirectory, 'simulation'), {
    dotfiles: 'deny', index: 'index.html', fallthrough: true,
  }));
  app.use('/practice', express.static(path.join(rootDirectory, 'practice'), {
    dotfiles: 'deny', index: 'index.html', fallthrough: true,
  }));

  app.get('/api/members', (_req, res) => {
    res.json(members.map(({ slug, name }) => ({ slug, name, href: `/codeapi/${slug}/` })));
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'vic-api-git-lab' }));

  for (const member of members) {
    const publicRoot = path.join(rootDirectory, 'codeapi', member.slug, 'public');
    const base = `/codeapi/${member.slug}`;
    app.get(base, (req, res, next) => {
      if (req.path === base) return res.redirect(308, `${base}/`);
      return next();
    });
    app.use(base, express.static(publicRoot, {
      dotfiles: 'deny', index: 'index.html', fallthrough: true,
    }));
    app.use(`${base}/api`, (req, res, next) => {
      const loaded = routers.get(member.slug);
      if (loaded?.router) return loaded.router(req, res, next);
      return res.status(500).json({
        error: { code: 'MEMBER_API_UNAVAILABLE', message: loaded?.error || 'Backend chưa sẵn sàng.' },
      });
    });
  }

  app.use((_req, res) => res.status(404).type('text').send('Không tìm thấy trang hoặc API này.'));
  app.use((error, _req, res, _next) => {
    if (error?.type === 'entity.parse.failed') {
      return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Body JSON không hợp lệ.' } });
    }
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: { code: 'BODY_TOO_LARGE', message: 'Body vượt quá giới hạn.' } });
    }
    console.error(`[http] ${error.message}`);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Đã có lỗi phía server.' } });
  });

  return app;
}

export async function startServer() {
  const app = await createApp();
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '127.0.0.1';
  return app.listen(port, host, () => {
    console.log(`VIC API & Git Lab chạy tại http://${host}:${port}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error(`Không thể khởi động server: ${error.message}`);
    process.exitCode = 1;
  });
}
