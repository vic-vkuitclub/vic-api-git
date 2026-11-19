import { Router } from 'express';

function todo(res, operation) {
  return res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: `TODO: học viên tự viết handler ${operation}.`,
    },
  });
}

// Infra injects getSupabase() and LAB_CATEGORY_ID lazily; handlers remain student work.
export function createRouter(context) {
  const router = Router();
  // TODO: đọc và validate context trong các handler cần kết nối database.
  void context;

  router.get('/products', (_req, res) => todo(res, 'GET /products'));
  // Bài mở rộng: tự hoàn thiện GET /products/:id nếu còn thời gian.
  router.get('/products/:id', (_req, res) => todo(res, 'GET /products/:id'));
  router.post('/products', (_req, res) => todo(res, 'POST /products'));
  router.patch('/products/:id', (_req, res) => todo(res, 'PATCH /products/:id'));
  router.delete('/products/:id', (_req, res) => todo(res, 'DELETE /products/:id'));

  return router;
}
