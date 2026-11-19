// This simulator intentionally has no fetch/XHR calls. Its database exists only in this tab.
const seedProducts = [
  { id: 1, category_id: 1, name: 'Trà đào', price: 25000, stock: 20 },
  { id: 2, category_id: 1, name: 'Cà phê sữa', price: 20000, stock: 15 },
  { id: 3, category_id: 2, name: 'Bánh mì', price: 18000, stock: 10 },
  { id: 4, category_id: 2, name: 'Cơm gà', price: 45000, stock: 8 },
  { id: 5, category_id: 3, name: 'Móc khóa VIC', price: 15000, stock: 30 },
  { id: 6, category_id: 3, name: 'Sticker VIC', price: 5000, stock: 50 },
];
let products = structuredClone(seedProducts);
let history = [];
let previous = structuredClone(products);
let changed = { type: 'none', id: null };

const byId = (id) => document.getElementById(id);
const methodInput = byId('method');
const endpointKindInput = byId('endpoint-kind');
const endpointIdInput = byId('endpoint-id');
const endpointIdRow = byId('endpoint-id-row');
const queryInput = byId('query');
const scenarioInput = byId('scenario');
const bodyInput = byId('body');
const sendButton = byId('send-button');

function clone(value) { return structuredClone(value); }
const responseProduct = (product) => ({
  id: product.id, categoryId: product.category_id, name: product.name,
  price: product.price, stock: product.stock,
});
function currentPath() {
  return endpointKindInput.value === 'list' ? '/products' : `/products/${endpointIdInput.value.trim() || ':id'}`;
}
function setPath(path) {
  const match = path.match(/^\/products\/([^/]+)\/?$/);
  if (match) {
    endpointKindInput.value = 'detail';
    endpointIdInput.value = match[1];
  } else {
    endpointKindInput.value = 'list';
  }
  updateEndpointControls();
}
function updateEndpointControls() {
  const isDetail = endpointKindInput.value === 'detail';
  endpointIdRow.hidden = !isDetail;
  endpointIdInput.disabled = !isDetail;
}
function findId(path) {
  const match = path.match(/^\/products\/([^/]+)\/?$/);
  if (!match) return null;
  if (!/^\d+$/.test(match[1])) return Number.NaN;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : Number.NaN;
}
function parseBody(text) {
  if (!text.trim()) return { ok: false, error: 'Body JSON đang để trống.' };
  try {
    const parsed = JSON.parse(text);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') return { ok: false, error: 'Body phải là một JSON object.' };
    return { ok: true, value: parsed };
  } catch { return { ok: false, error: 'JSON sai cú pháp. Kiểm tra dấu ngoặc, dấu phẩy và dấu nháy.' }; }
}
function validateProduct(body, { partial = false } = {}) {
  const allowed = ['name', 'price', 'stock'];
  if (Object.keys(body).some((key) => !allowed.includes(key))) return 'Chỉ được gửi name, price và stock.';
  if (partial && Object.keys(body).length === 0) return 'PATCH cần ít nhất một trường để sửa.';
  for (const field of allowed) {
    if (!(field in body)) {
      if (!partial) return `Thiếu trường ${field}.`;
      continue;
    }
    const value = body[field];
    if (field === 'name' && (typeof value !== 'string' || value.trim().length < 1 || value.trim().length > 150)) return 'name phải có từ 1 đến 150 ký tự.';
    if (field !== 'name' && (!Number.isSafeInteger(value) || value < 0 || value > 2147483647)) return `${field} phải là số nguyên từ 0 đến 2.147.483.647.`;
  }
  return null;
}
function response(status, body, summary, { network = false } = {}) { return { status, body, summary, network }; }

function simulate(method, rawPath, query, rawBody, scenario) {
  if (scenario === 'network') return response(null, null, 'Mô phỏng mất mạng: không có HTTP status và không có response.', { network: true });
  if (scenario === 'server') return response(500, { error: { code: 'SIMULATED_SERVER_ERROR', message: 'Lỗi server được chủ động mô phỏng.' } }, 'Server giả trả 500; database không đổi.');

  const path = rawPath.trim();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const id = findId(normalizedPath);
  const isCollection = /^\/products\/?$/.test(normalizedPath);
  const isDetail = id !== null;
  if (!isCollection && !isDetail) return response(404, { error: { code: 'NOT_FOUND', message: 'Không tìm thấy endpoint mô phỏng này.' } }, 'Path không tồn tại trong API mô phỏng.');
  if (isDetail && Number.isNaN(id)) return response(400, { error: { code: 'INVALID_ID', message: 'id phải là số nguyên dương.' } }, 'Path có id không hợp lệ.');

  if (method === 'GET') {
    if (isDetail) {
      const product = products.find((item) => item.id === id);
      return product ? response(200, responseProduct(product), 'Đọc một sản phẩm; database không đổi.') : response(404, { error: { code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm.' } }, 'id không có trong database.');
    }
    const needle = query.trim().toLocaleLowerCase('vi');
    const result = products.filter((item) => !needle || item.name.toLocaleLowerCase('vi').includes(needle));
    return response(200, result.map(responseProduct), `Đọc ${result.length} sản phẩm${needle ? ` khớp “${query.trim()}”` : ''}; database không đổi.`);
  }

  if (isCollection && method === 'POST') {
    const parsed = parseBody(rawBody);
    if (!parsed.ok) return response(400, { error: { code: 'INVALID_BODY', message: parsed.error } }, 'Body chưa hợp lệ; database không đổi.');
    const error = validateProduct(parsed.value);
    if (error) return response(400, { error: { code: 'VALIDATION_ERROR', message: error } }, 'Dữ liệu không hợp lệ; database không đổi.');
    const product = { id: Math.max(0, ...products.map((item) => item.id)) + 1, category_id: 1, name: parsed.value.name.trim(), price: parsed.value.price, stock: parsed.value.stock };
    products = [...products, product];
    changed = { type: 'added', id: product.id };
    return response(201, responseProduct(product), `Tạo sản phẩm id ${product.id}; database có thêm một hàng.`);
  }

  if (isDetail && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
    const index = products.findIndex((item) => item.id === id);
    if (index < 0) return response(404, { error: { code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm.' } }, 'Không có hàng để sửa/xóa.');
    if (method === 'DELETE') {
      const [removed] = products.splice(index, 1);
      changed = { type: 'deleted', id };
      return response(204, null, `Đã xóa “${removed.name}”. Status 204 không có body.`);
    }
    const parsed = parseBody(rawBody);
    if (!parsed.ok) return response(400, { error: { code: 'INVALID_BODY', message: parsed.error } }, 'Body chưa hợp lệ; database không đổi.');
    const error = validateProduct(parsed.value, { partial: method === 'PATCH' });
    if (error) return response(400, { error: { code: 'VALIDATION_ERROR', message: error } }, 'Dữ liệu không hợp lệ; database không đổi.');
    const updated = { ...products[index], ...parsed.value };
    if (typeof parsed.value.name === 'string') updated.name = parsed.value.name.trim();
    products[index] = updated;
    changed = { type: 'updated', id };
    return response(200, responseProduct(updated), method === 'PUT' ? 'PUT thay thế các trường được phép; database đã cập nhật.' : 'PATCH chỉ cập nhật trường gửi lên; trường khác được giữ nguyên.');
  }

  if (method === 'POST' && isDetail) return response(405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'POST chỉ dùng ở /products.' } }, 'Method không được phép ở path này.');
  if (['PUT', 'PATCH', 'DELETE'].includes(method) && isCollection) return response(405, { error: { code: 'METHOD_NOT_ALLOWED', message: `${method} cần path /products/:id.` } }, 'Method không được phép ở path này.');
  return response(405, { error: { code: 'METHOD_NOT_ALLOWED', message: `${method} chưa được hỗ trợ ở endpoint này.` } }, 'Method không được hỗ trợ.');
}

function drawTable(targetId, rows, { mark = false } = {}) {
  const tbody = byId(targetId);
  tbody.replaceChildren();
  for (const product of rows) {
    const tr = document.createElement('tr');
    if (mark && product.id === changed.id) tr.classList.add(`row-${changed.type}`);
    for (const value of [product.id, product.name, product.price.toLocaleString('vi-VN'), product.stock]) {
      const td = document.createElement('td');
      td.textContent = String(value);
      tr.append(td);
    }
    tbody.append(tr);
  }
  if (mark && changed.type === 'deleted') {
    const removed = previous.find((item) => item.id === changed.id);
    if (removed) {
      const tr = document.createElement('tr');
      tr.className = 'row-deleted';
      for (const value of [removed.id, removed.name, removed.price.toLocaleString('vi-VN'), removed.stock]) {
        const td = document.createElement('td'); td.textContent = String(value); tr.append(td);
      }
      tbody.append(tr);
    }
  }
}
function renderDatabase() {
  drawTable('before-table', previous);
  drawTable('after-table', products, { mark: true });
  byId('before-count').textContent = `${previous.length} sản phẩm`;
  byId('after-count').textContent = `${products.length} sản phẩm${changed.type === 'deleted' ? ' · hiển thị thêm hàng đã xóa' : ''}`;
  const notes = { none: 'Chưa có thay đổi. GET chỉ đọc dữ liệu.', added: `Đã thêm bản ghi id ${changed.id}.`, updated: `Đã sửa bản ghi id ${changed.id}.`, deleted: `Đã xóa bản ghi id ${changed.id}; hàng bị xóa vẫn hiện ở trạng thái TRƯỚC.` };
  byId('change-note').textContent = notes[changed.type];
}
function renderHistory() {
  const list = byId('history-list');
  list.replaceChildren();
  byId('history-count').textContent = `${history.length} / 12`;
  if (!history.length) {
    const item = document.createElement('li'); item.className = 'muted'; item.textContent = 'Các lần gửi sẽ xuất hiện ở đây.'; list.append(item); return;
  }
  for (const [index, record] of history.entries()) {
    const li = document.createElement('li'); li.className = 'history-item';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'history-load'; button.setAttribute('aria-label', `Nạp lại request ${record.method} ${record.path}`);
    const method = document.createElement('span'); method.className = 'history-method'; method.textContent = record.method;
    const path = document.createElement('span'); path.className = 'history-path'; path.textContent = `${record.path}${record.query ? `?q=${record.query}` : ''}`;
    const code = document.createElement('span'); code.className = 'history-code'; code.textContent = record.result.network ? 'NET' : String(record.result.status);
    button.append(method, path, code); button.addEventListener('click', () => {
      methodInput.value = record.method; setPath(record.path); queryInput.value = record.query; scenarioInput.value = record.scenario; bodyInput.value = record.body;
      byId('request-status').textContent = `Request ${index + 1} đã nạp; bấm Gửi để chạy lại.`;
    });
    li.append(button); list.append(li);
  }
}
function renderResponse(result) {
  const badge = byId('response-status');
  badge.className = `status-badge ${result.network ? 'is-network' : result.status >= 400 ? 'is-error' : 'is-ok'}`;
  badge.textContent = result.network ? 'Không có HTTP' : `${result.status} ${({ 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 404: 'Not Found', 405: 'Method Not Allowed', 500: 'Server Error' })[result.status] || ''}`;
  byId('response-summary').textContent = result.summary;
  byId('response-body').textContent = result.network ? 'Không nhận được phản hồi HTTP. Đây là tình huống mất mạng được mô phỏng.' : result.body === null ? '204 No Content\n// response body rỗng' : JSON.stringify(result.body, null, 2);
}
function send() {
  previous = clone(products);
  changed = { type: 'none', id: null };
  const method = methodInput.value;
  const path = currentPath();
  const query = queryInput.value;
  const rawBody = bodyInput.value;
  const scenario = scenarioInput.value;
  const result = simulate(method, path, query, rawBody, scenario);
  history.unshift({ method, path, query, body: rawBody, scenario, result });
  history = history.slice(0, 12);
  renderResponse(result);
  renderDatabase();
  renderHistory();
  byId('request-status').textContent = result.network ? 'Mô phỏng hoàn tất · không có response HTTP.' : `Mô phỏng hoàn tất · status ${result.status}.`;
}
function reset() {
  products = clone(seedProducts); previous = clone(seedProducts); history = []; changed = { type: 'none', id: null };
  renderDatabase(); renderHistory();
  byId('request-status').textContent = 'Đã khôi phục database giả trong tab này.';
  byId('response-status').className = 'status-badge'; byId('response-status').textContent = 'Chưa gửi';
  byId('response-summary').textContent = 'Database giả đã được khôi phục.';
  byId('response-body').textContent = '// Chưa có response';
}

sendButton.addEventListener('click', send);
byId('reset-button').addEventListener('click', () => {
  if (window.confirm('Khôi phục database giả trong trang mô phỏng về dữ liệu ban đầu?')) reset();
});
byId('sample-button').addEventListener('click', () => {
  const defaults = { GET: ['/products', ''], POST: ['/products', '{\n  "name": "Trà vải",\n  "price": 22000,\n  "stock": 12\n}'], PUT: ['/products/1', '{\n  "name": "Trà đào cam sả",\n  "price": 28000,\n  "stock": 18\n}'], PATCH: ['/products/2', '{\n  "stock": 9\n}'], DELETE: ['/products/6', ''] };
  const [endpoint, body] = defaults[methodInput.value]; setPath(endpoint); bodyInput.value = body;
});
methodInput.addEventListener('change', () => {
  setPath(methodInput.value === 'POST' ? '/products' : methodInput.value === 'GET' ? currentPath() : '/products/1');
});
endpointKindInput.addEventListener('change', updateEndpointControls);
document.querySelectorAll('[data-challenge]').forEach((button) => button.addEventListener('click', () => {
  const challenge = button.dataset.challenge;
  const setup = {
    get: ['GET', '/products', 'trà', 'normal', ''],
    patch: ['PATCH', '/products/2', '', 'normal', '{\n  "stock": 9\n}'],
    delete: ['DELETE', '/products/6', '', 'normal', ''],
    invalid: ['POST', '/products', '', 'normal', '{"name":"Trà xanh", "price": }'],
  }[challenge];
  methodInput.value = setup[0]; setPath(setup[1]); queryInput.value = setup[2]; scenarioInput.value = setup[3]; bodyInput.value = setup[4];
  document.querySelector('#request-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  byId('request-status').textContent = 'Đã nạp thử thách. Dự đoán kết quả rồi bấm Gửi request.';
}));

renderDatabase();
updateEndpointControls();
