// BẢN ĐỒ CHỨC NĂNG BACKEND:
// GET /products        -> .select(): ĐỌC danh sách, trả 200.
// POST /products       -> .insert(): THÊM một sản phẩm, trả 201.
// PATCH /products/:id  -> .update().eq('id', ...): SỬA theo ID, trả 200.
// DELETE /products/:id -> .delete().eq('id', ...): XÓA theo ID, trả 204.
// Server chung mount router này tại /codeapi/hoangvu/api.

import { Router } from 'express';

// Đổi tên cột database thành categoryId trong JSON trả cho frontend.
const columns = 'id, categoryId:category_id, name, price, stock';

// Dùng chung cho lỗi input (400), không có sản phẩm (404) và lỗi database (500).
function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

// Kiểm tra ID trong URL trước khi sửa/xóa; không chấp nhận ID âm, chữ hoặc số quá lớn.
function validId(id) {
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

// KIỂM TRA BODY: POST cần đủ name/price/stock; PATCH (partial=true) chỉ cần trường muốn sửa.
// Backend luôn kiểm tra độc lập, kể cả khi form HTML đã có required/min/max.
function validateProduct(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Body phải là một JSON object.';
  }
  const fields = ['name', 'price', 'stock'];
  const keys = Object.keys(body);
  if (keys.length === 0) return 'Cần gửi ít nhất một trường.';
  if (keys.some((key) => !fields.includes(key))) {
    return 'Chỉ được gửi name, price và stock.';
  }
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
    } else if (!Number.isInteger(value) || value < 0 || value > 2147483647) {
      return `${field} phải là số nguyên từ 0 đến 2.147.483.647.`;
    }
  }
  return null;
}

// context được server chung truyền vào: getSupabase() lấy client, LAB_CATEGORY_ID lấy danh mục.
export function createRouter(context) {
  const router = Router();

  // 1. ĐỌC — fetchProducts() ở frontend gọi route này.
  // .select() đọc toàn bộ products chung, .order() sắp xếp theo ID.
  router.get('/products', async (_req, res) => {
    try {
      const supabase = context.getSupabase();
      const { data, error } = await supabase
        .from('products')
        .select(columns)
        .order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không tải được sản phẩm. Hãy thử lại.');
    }
  });

  // 2. THÊM — createProduct(product) ở frontend gọi route này.
  // .insert() ghi hàng mới; .select().single() lấy lại hàng vừa thêm để trả JSON.
  // Chỉ nhận 3 trường từ frontend; danh mục lấy từ config của backend.
  router.post('/products', async (req, res) => {
    const message = validateProduct(req.body);
    if (message) return sendError(res, 400, 'VALIDATION_ERROR', message);
    try {
      const supabase = context.getSupabase();
      const { data, error } = await supabase
        .from('products')
        .insert({
          category_id: context.LAB_CATEGORY_ID,
          name: req.body.name.trim(),
          price: req.body.price,
          stock: req.body.stock,
        })
        .select(columns)
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không thêm được sản phẩm. Hãy thử lại.');
    }
  });

  // 3. SỬA — updateProduct(id, product) ở frontend gọi route này.
  // .update(changes) ghi trường mới; .eq() chỉ chọn hàng có ID trong URL.
  // PATCH cho phép sửa một hoặc nhiều trường; luôn lọc đúng ID.
  router.patch('/products/:id', async (req, res) => {
    if (!validId(req.params.id)) return sendError(res, 400, 'INVALID_ID', 'ID phải là số nguyên dương an toàn.');
    const message = validateProduct(req.body, true);
    if (message) return sendError(res, 400, 'VALIDATION_ERROR', message);
    const changes = { ...req.body };
    if (Object.hasOwn(changes, 'name')) changes.name = changes.name.trim();
    try {
      const supabase = context.getSupabase();
      const { data, error } = await supabase
        .from('products')
        .update(changes)
        .eq('id', req.params.id)
        .select(columns)
        .maybeSingle(); // Có hàng -> object; không có -> null để trả 404.
      if (error) throw error;
      if (!data) return sendError(res, 404, 'PRODUCT_NOT_FOUND', 'Sản phẩm không còn tồn tại.');
      return res.status(200).json(data);
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không sửa được sản phẩm. Hãy thử lại.');
    }
  });

  // 4. XÓA — deleteProduct(id) ở frontend gọi route này.
  // .delete().eq() xóa đúng một ID; không gọi delete() mà bỏ điều kiện ID.
  // Yêu cầu trả ID bị xóa để phân biệt thành công với không tìm thấy.
  router.delete('/products/:id', async (req, res) => {
    if (!validId(req.params.id)) return sendError(res, 400, 'INVALID_ID', 'ID phải là số nguyên dương an toàn.');
    try {
      const supabase = context.getSupabase();
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .select('id')
        .maybeSingle(); // Có hàng -> object; không có -> null để trả 404.
      if (error) throw error;
      if (!data) return sendError(res, 404, 'PRODUCT_NOT_FOUND', 'Sản phẩm không còn tồn tại.');
      return res.status(204).end(); // Xóa thành công, HTTP 204 không có response body.
    } catch {
      return sendError(res, 500, 'DATABASE_ERROR', 'Không xóa được sản phẩm. Hãy thử lại.');
    }
  });

  return router;
}
