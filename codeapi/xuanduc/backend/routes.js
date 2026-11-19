import { Router } from 'express';

// Gửi lỗi theo cùng một cấu trúc JSON để frontend luôn đọc được mã và nội dung lỗi.
function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

// Chuyển id trong URL thành số nguyên dương an toàn, hoặc trả null nếu định dạng sai.
function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

// Kiểm tra body tạo/sửa sản phẩm, chỉ chấp nhận trường hợp lệ và trả về dữ liệu đã chuẩn hóa.
// Chế độ partial dùng cho PATCH, nơi chỉ cần gửi các trường muốn thay đổi.
function validateProduct(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Body phải là object JSON.' };
  }

  const allowedFields = ['name', 'price', 'stock'];
  const keys = Object.keys(input);
  if (keys.some((key) => !allowedFields.includes(key))) {
    return { error: 'Chỉ được gửi name, price và stock.' };
  }
  if (partial && keys.length === 0) return { error: 'Body PATCH không được rỗng.' };

  const values = {};
  if (!partial || Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string') return { error: 'name phải là chuỗi.' };
    values.name = input.name.trim();
    if (values.name.length < 1 || values.name.length > 150) {
      return { error: 'name phải có từ 1 đến 150 ký tự sau khi trim.' };
    }
  }

  for (const field of ['price', 'stock']) {
    if (!partial || Object.hasOwn(input, field)) {
      const value = input[field];
      if (!Number.isInteger(value) || value < 0 || value > 2147483647) {
        return { error: `${field} phải là số nguyên từ 0 đến 2.147.483.647.` };
      }
      values[field] = value;
    }
  }

  return { values };
}

// Đổi tên cột database sang hợp đồng JSON camelCase mà API cung cấp cho frontend.
function toProduct(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    price: row.price,
    stock: row.stock,
  };
}

// Chuyển lỗi database phổ biến thành HTTP phù hợp, không để lộ chi tiết nội bộ ra response.
function sendDatabaseError(res, error) {
  if (error?.code === '23503') {
    return sendError(res, 404, 'CATEGORY_NOT_FOUND', 'Danh mục cấu hình không tồn tại.');
  }
  return sendError(res, 500, 'DATABASE_ERROR', 'Không thể hoàn thành thao tác với sản phẩm.');
}

// Infra injects getSupabase() and LAB_CATEGORY_ID lazily; handlers remain student work.
// Tạo router cho API products và dùng context chung để truy cập Supabase cùng category cấu hình.
export function createRouter(context) {
  const router = Router();
  router.get('/products', async (_req, res) => {
    try {
      const { data, error } = await context.getSupabase()
        .from('products')
        .select('id, category_id, name, price, stock')
        .order('id', { ascending: true });
      if (error) return sendDatabaseError(res, error);
      return res.status(200).json(data.map(toProduct));
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không thể tải danh sách sản phẩm.');
    }
  });
  // Bài mở rộng: tự hoàn thiện GET /products/:id nếu còn thời gian.
  router.get('/products/:id', (_req, res) => sendError(res, 404, 'NOT_FOUND', 'Không tìm thấy endpoint.'));

  router.post('/products', async (req, res) => {
    const validation = validateProduct(req.body);
    if (validation.error) return sendError(res, 400, 'VALIDATION_ERROR', validation.error);
    try {
      const { data, error } = await context.getSupabase()
        .from('products')
        .insert({ ...validation.values, category_id: context.LAB_CATEGORY_ID })
        .select('id, category_id, name, price, stock')
        .single();
      if (error) return sendDatabaseError(res, error);
      return res.status(201).json(toProduct(data));
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không thể tạo sản phẩm.');
    }
  });

  router.patch('/products/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, 'INVALID_ID', 'id phải là số nguyên dương.');
    const validation = validateProduct(req.body, { partial: true });
    if (validation.error) return sendError(res, 400, 'VALIDATION_ERROR', validation.error);
    try {
      const { data, error } = await context.getSupabase()
        .from('products')
        .update(validation.values)
        .eq('id', id)
        .select('id, category_id, name, price, stock')
        .maybeSingle();
      if (error) return sendDatabaseError(res, error);
      if (!data) return sendError(res, 404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
      return res.status(200).json(toProduct(data));
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không thể cập nhật sản phẩm.');
    }
  });

  router.delete('/products/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, 'INVALID_ID', 'id phải là số nguyên dương.');
    try {
      const { data, error } = await context.getSupabase()
        .from('products')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) return sendDatabaseError(res, error);
      if (!data) return sendError(res, 404, 'NOT_FOUND', 'Không tìm thấy sản phẩm.');
      return res.status(204).end();
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không thể xóa sản phẩm.');
    }
  });

  return router;
}
