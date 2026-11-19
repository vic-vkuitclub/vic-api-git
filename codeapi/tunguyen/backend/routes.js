import { Router } from 'express';

const columns = 'id, categoryId:category_id, name, price, stock';
const MAX_INTEGER = 2147483647;

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function validId(id) {
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

function validateProduct(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Body phải là một JSON object.';
  }
  const fields = ['name', 'price', 'stock'];
  const keys = Object.keys(body);
  if (keys.length === 0) return 'Cần gửi ít nhất một trường.';
  if (keys.some((key) => !fields.includes(key))) return 'Chỉ được gửi name, price và stock.';
  for (const field of fields) {
    if (!Object.hasOwn(body, field)) {
      if (!partial) return `Thiếu trường ${field}.`;
      continue;
    }
    const value = body[field];
    if (field === 'name') {
      if (typeof value !== 'string' || value.trim().length < 1 || value.trim().length > 150) {
        return 'Tên phải có từ 1 đến 150 ký tự sau khi bỏ khoảng trắng hai đầu.';
      }
    } else if (!Number.isInteger(value) || value < 0 || value > MAX_INTEGER) {
      return `${field} phải là số nguyên từ 0 đến ${MAX_INTEGER}.`;
    }
  }
  return null;
}

export function createRouter(context) {
  const router = Router();

  router.get('/products', async (_req, res) => {
    try {
      const { data, error } = await context.getSupabase()
        .from('products').select(columns).order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không tải được sản phẩm. Hãy thử lại.');
    }
  });

  router.post('/products', async (req, res) => {
    const message = validateProduct(req.body);
    if (message) return sendError(res, 400, 'VALIDATION_ERROR', message);
    try {
      const { data, error } = await context.getSupabase().from('products').insert({
        category_id: context.LAB_CATEGORY_ID,
        name: req.body.name.trim(),
        price: req.body.price,
        stock: req.body.stock,
      }).select(columns).single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không thêm được sản phẩm. Hãy thử lại.');
    }
  });

  router.patch('/products/:id', async (req, res) => {
    if (!validId(req.params.id)) return sendError(res, 400, 'INVALID_ID', 'ID phải là số nguyên dương an toàn.');
    const message = validateProduct(req.body, true);
    if (message) return sendError(res, 400, 'VALIDATION_ERROR', message);
    const changes = { ...req.body };
    if (Object.hasOwn(changes, 'name')) changes.name = changes.name.trim();
    try {
      const { data, error } = await context.getSupabase().from('products')
        .update(changes).eq('id', req.params.id).select(columns).maybeSingle();
      if (error) throw error;
      if (!data) return sendError(res, 404, 'PRODUCT_NOT_FOUND', 'Sản phẩm không còn tồn tại.');
      return res.status(200).json(data);
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không sửa được sản phẩm. Hãy thử lại.');
    }
  });

  router.delete('/products/:id', async (req, res) => {
    if (!validId(req.params.id)) return sendError(res, 400, 'INVALID_ID', 'ID phải là số nguyên dương an toàn.');
    try {
      const { data, error } = await context.getSupabase().from('products')
        .delete().eq('id', req.params.id).select('id').maybeSingle();
      if (error) throw error;
      if (!data) return sendError(res, 404, 'PRODUCT_NOT_FOUND', 'Sản phẩm không còn tồn tại.');
      return res.status(204).end();
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không xóa được sản phẩm. Hãy thử lại.');
    }
  });

  return router;
}
