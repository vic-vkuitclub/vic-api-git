// BẢN ĐỒ CHỨC NĂNG FRONTEND:
// XEM: mở trang / nút Tải lại -> refreshProducts -> loadProducts -> fetchProducts (GET).
// THÊM: điền form -> submit -> createProduct (POST) -> loadProducts để GET lại.
// SỬA: nút Sửa -> startEdit điền form -> submit -> updateProduct (PATCH) -> GET lại.
// XÓA: nút Xóa -> handleDelete xác nhận -> deleteProduct (DELETE) -> GET lại.
// Backend xử lý từng request này tại ../backend/routes.js.

// URL tương đối: ở trang /codeapi/thuong/ sẽ gọi /codeapi/thuong/api/products.
const API_URL = './api/products';
const form = document.querySelector('#product-form');
const nameInput = document.querySelector('#name');
const priceInput = document.querySelector('#price');
const stockInput = document.querySelector('#stock');
const tableBody = document.querySelector('#products-body');
const status = document.querySelector('#status');
const workspace = document.querySelector('#workspace');
const cancelButton = document.querySelector('#cancel-edit');
let editingId = null; // null = đang thêm; có ID = đang sửa.

// Hiển thị trạng thái tải, thành công hoặc lỗi ở dòng #status.
function showStatus(message, isError = false) {
  status.textContent = message;
  status.className = isError ? 'error' : '';
}

// Đọc JSON lỗi backend gửi về để các hàm fetch báo lỗi cho giao diện.
async function apiError(response) {
  const body = await response.json();
  const error = new Error(body.error?.message || `Request thất bại: ${response.status}`);
  error.status = response.status;
  return error;
}

// ĐỌC DANH SÁCH: GET không gửi body; nhận mảng sản phẩm từ backend.
async function fetchProducts() {
  const response = await fetch(API_URL);
  if (!response.ok) throw await apiError(response);
  return response.json();
}

// THÊM: POST gửi name/price/stock dưới dạng JSON; nhận sản phẩm mới và ID do DB cấp.
async function createProduct(product) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

// SỬA: PATCH gửi thông tin mới; ID trong URL xác định sản phẩm cần sửa.
async function updateProduct(id, product) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}

// XÓA: DELETE gửi ID trong URL; backend xóa đúng sản phẩm này.
async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw await apiError(response);
  // 204 không có body, vì vậy không gọi response.json().
}

// CHẾ ĐỘ THÊM: xóa input và ID đang sửa. Hàm này chỉ đổi form, chưa gọi API.
function startCreate() {
  editingId = null;
  form.reset();
  document.querySelector('#form-title').textContent = 'Thêm sản phẩm';
  cancelButton.hidden = true;
}

// CHẾ ĐỘ SỬA: lưu ID và điền dữ liệu hàng vào form. Chỉ khi bấm Lưu mới gửi PATCH.
function startEdit(product) {
  editingId = product.id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  stockInput.value = product.stock;
  document.querySelector('#form-title').textContent = `Sửa sản phẩm #${product.id}`;
  cancelButton.hidden = false;
  nameInput.focus();
}

// HIỂN THỊ: tạo các hàng trong bảng từ response GET, kèm nút Sửa/Xóa mỗi hàng.
function renderProducts(products) {
  tableBody.replaceChildren();
  if (products.length === 0) {
    const row = tableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = 'Chưa có sản phẩm.';
    return;
  }
  for (const product of products) {
    const row = tableBody.insertRow();
    for (const value of [product.id, product.name, product.price.toLocaleString('vi-VN'), product.stock]) {
      row.insertCell().textContent = value;
    }
    const actions = row.insertCell();
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'btn btn-secondary btn-small';
    editButton.textContent = 'Sửa';
    editButton.setAttribute('aria-label', `Sửa sản phẩm #${product.id}`);
    editButton.addEventListener('click', () => startEdit(product));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-secondary btn-small';
    deleteButton.textContent = 'Xóa';
    deleteButton.setAttribute('aria-label', `Xóa sản phẩm #${product.id}`);
    deleteButton.addEventListener('click', () => handleDelete(product));
    actions.append(editButton, deleteButton);
  }
}

// State trong browser chỉ dùng để hiển thị. Mỗi lần tải đều GET từ backend.
async function loadProducts() {
  const products = await fetchProducts();
  renderProducts(products);
}

// NÚT TẢI LẠI / LẦN MỞ TRANG: khóa thao tác, GET dữ liệu và báo lỗi nếu có.
async function refreshProducts() {
  workspace.disabled = true;
  showStatus('Đang tải dữ liệu…');
  try {
    await loadProducts();
    showStatus('Đã tải dữ liệu mới nhất.');
  } catch (error) {
    showStatus(`Không tải được dữ liệu: ${error.message}`, true);
  } finally {
    workspace.disabled = false;
  }
}

// NÚT LƯU: cả THÊM và SỬA cùng đi qua sự kiện submit này.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const product = {
    name: nameInput.value,
    price: Number(priceInput.value),
    stock: Number(stockInput.value),
  };
  workspace.disabled = true;
  showStatus('Đang lưu…');
  let saved = false;
  try {
    if (editingId === null) await createProduct(product);
    else await updateProduct(editingId, product);
    saved = true;
    startCreate();
    await loadProducts();
    showStatus('Đã lưu sản phẩm.');
  } catch (error) {
    if (saved) {
      showStatus('Đã lưu nhưng chưa tải lại được danh sách. Bấm Tải lại dữ liệu.', true);
    } else {
      showStatus(`Không lưu được: ${error.message} Input được giữ lại để bạn kiểm tra.`, true);
    }
  } finally {
    workspace.disabled = false;
  }
});

// LUỒNG XÓA: xác nhận -> DELETE theo ID -> GET lại bảng; hủy xác nhận thì không gọi API.
async function handleDelete(product) {
  if (!window.confirm(`Xóa sản phẩm #${product.id}: ${product.name}?`)) return;
  workspace.disabled = true;
  showStatus('Đang xóa…');
  let deleted = false;
  try {
    await deleteProduct(product.id);
    deleted = true;
    if (editingId === product.id) startCreate();
    await loadProducts();
    showStatus('Đã xóa sản phẩm.');
  } catch (error) {
    if (deleted) {
      showStatus('Đã xóa nhưng chưa tải lại được danh sách. Bấm Tải lại dữ liệu.', true);
    } else {
      showStatus(`Không xóa được: ${error.message} Bấm Tải lại dữ liệu để kiểm tra.`, true);
    }
  } finally {
    workspace.disabled = false;
  }
}

cancelButton.addEventListener('click', startCreate);
document.querySelector('#reload').addEventListener('click', refreshProducts);
refreshProducts();
