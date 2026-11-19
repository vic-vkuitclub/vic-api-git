// BẢN ĐỒ CHỨC NĂNG FRONTEND (Hoàng Vũ):
// XEM: mở trang / nút Tải lại -> refreshProducts -> loadProducts -> fetchProducts (GET).
// THÊM: điền form chính -> submit -> createProduct (POST) -> loadProducts để GET lại.
// SỬA: nút Sửa trên card -> openEditModal -> submit modal -> updateProduct (PATCH) -> GET lại.
// XÓA: nút Xóa trên card -> handleDelete xác nhận -> deleteProduct (DELETE) -> GET lại.
// Backend xử lý từng request này tại ../backend/routes.js.

// URL tương đối: ở trang /codeapi/hoangvu/ sẽ gọi /codeapi/hoangvu/api/products.
const API_URL = './api/products';

// --- DOM elements ---
const form         = document.querySelector('#product-form');
const nameInput    = document.querySelector('#name');
const priceInput   = document.querySelector('#price');
const stockInput   = document.querySelector('#stock');
const statusEl     = document.querySelector('#status');
const workspace    = document.querySelector('#workspace');
const cancelBtn    = document.querySelector('#cancel-edit');
const productsGrid = document.querySelector('#products-grid');
const productCount = document.querySelector('#product-count');

// Modal sửa
const editModal   = document.querySelector('#edit-modal');
const editForm    = document.querySelector('#edit-form');
const editName    = document.querySelector('#edit-name');
const editPrice   = document.querySelector('#edit-price');
const editStock   = document.querySelector('#edit-stock');
const modalTitle  = document.querySelector('#modal-title');
const modalClose  = document.querySelector('#modal-close');
const modalCancel = document.querySelector('#modal-cancel');

let editingId = null; // null = đang thêm; có ID = đang sửa trong modal.

// =========================================================
// HIỂN THỊ TRẠNG THÁI
// =========================================================
function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = 'status-bar';
  if (type === 'error')   statusEl.classList.add('error');
  if (type === 'success') statusEl.classList.add('success');
}

// =========================================================
// XỬ LÝ LỖI API
// =========================================================
async function apiError(response) {
  const body = await response.json();
  const error = new Error(body.error?.message || `Request thất bại: ${response.status}`);
  error.status = response.status;
  return error;
}

// =========================================================
// CÁC HÀM GỌI API
// =========================================================

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
  // 204 không có body, không gọi response.json().
}

// =========================================================
// RENDER CARDS
// =========================================================
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + ' ₫';
}

// Escape HTML để hiển thị tên sản phẩm an toàn.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProducts(products) {
  productsGrid.replaceChildren();
  productCount.textContent = `${products.length} sản phẩm`;

  if (products.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<span class="empty-state-icon">📦</span><p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>`;
    productsGrid.appendChild(empty);
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = `${index * 40}ms`;

    card.innerHTML = `
      <span class="card-id">ID #${product.id}</span>
      <div class="card-name">${escapeHtml(product.name)}</div>
      <div class="card-meta">
        <div class="card-badge">
          <span class="card-badge-label">Giá</span>
          <span class="card-badge-value price">${formatPrice(product.price)}</span>
        </div>
        <div class="card-badge">
          <span class="card-badge-label">Tồn kho</span>
          <span class="card-badge-value stock">${product.stock}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-btn card-btn-edit"
                aria-label="Sửa sản phẩm ${escapeHtml(product.name)}"
                data-action="edit">✏️ Sửa</button>
        <button class="card-btn card-btn-delete"
                aria-label="Xóa sản phẩm ${escapeHtml(product.name)}"
                data-action="delete">🗑️ Xóa</button>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener('click', () => openEditModal(product));
    card.querySelector('[data-action="delete"]').addEventListener('click', () => handleDelete(product));
    productsGrid.appendChild(card);
  });
}

// =========================================================
// TẢI & LÀM MỚI DANH SÁCH
// =========================================================

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
    showStatus('Đã tải dữ liệu mới nhất.', 'success');
  } catch (error) {
    showStatus(`Không tải được: ${error.message}`, 'error');
  } finally {
    workspace.disabled = false;
  }
}

// =========================================================
// FORM THÊM SẢN PHẨM
// =========================================================
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Giữ trang, tự gửi fetch thay vì submit HTML tải lại trang.
  const product = {
    name:  nameInput.value,
    price: Number(priceInput.value),
    stock: Number(stockInput.value),
  };
  workspace.disabled = true;
  showStatus('Đang thêm sản phẩm…');
  let saved = false;
  try {
    await createProduct(product);
    saved = true;
    form.reset();
    await loadProducts(); // GET lại để hiển thị dữ liệu chung sau khi ghi.
    showStatus('✅ Đã thêm sản phẩm mới.', 'success');
  } catch (error) {
    if (saved) {
      showStatus('Đã thêm nhưng chưa tải lại được danh sách. Bấm Tải lại dữ liệu.', 'error');
    } else {
      showStatus(`Không thêm được: ${error.message}`, 'error');
    }
  } finally {
    workspace.disabled = false;
  }
});

cancelBtn.addEventListener('click', () => {
  form.reset();
  cancelBtn.hidden = true;
});

// =========================================================
// MODAL SỬA
// =========================================================

// Mở modal và điền dữ liệu sản phẩm vào form.
function openEditModal(product) {
  editingId        = product.id;
  editName.value   = product.name;
  editPrice.value  = product.price;
  editStock.value  = product.stock;
  modalTitle.textContent = `✏️ Sửa sản phẩm #${product.id}`;
  editModal.hidden = false;
  editName.focus();
}

// Đóng modal và reset form.
function closeEditModal() {
  editModal.hidden = true;
  editingId = null;
  editForm.reset();
}

modalClose.addEventListener('click', closeEditModal);
modalCancel.addEventListener('click', closeEditModal);

// Đóng modal khi click ra ngoài box.
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// Phím Escape đóng modal.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.hidden) closeEditModal();
});

// Submit modal -> gửi PATCH.
editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!editingId) return;
  const product = {
    name:  editName.value,
    price: Number(editPrice.value),
    stock: Number(editStock.value),
  };
  workspace.disabled = true;
  showStatus('Đang lưu thay đổi…');
  let saved = false;
  try {
    await updateProduct(editingId, product);
    saved = true;
    closeEditModal();
    await loadProducts(); // GET lại để đồng bộ dữ liệu.
    showStatus('✅ Đã cập nhật sản phẩm.', 'success');
  } catch (error) {
    if (saved) {
      showStatus('Đã lưu nhưng chưa tải lại được danh sách. Bấm Tải lại dữ liệu.', 'error');
    } else {
      showStatus(`Không sửa được: ${error.message}`, 'error');
    }
  } finally {
    workspace.disabled = false;
  }
});

// =========================================================
// XÓA SẢN PHẨM
// =========================================================

// LUỒNG XÓA: xác nhận -> DELETE theo ID -> GET lại bảng; hủy xác nhận thì không gọi API.
async function handleDelete(product) {
  if (!window.confirm(`Xóa sản phẩm #${product.id}: ${product.name}?`)) return;
  workspace.disabled = true;
  showStatus('Đang xóa…');
  let deleted = false;
  try {
    await deleteProduct(product.id);
    deleted = true;
    await loadProducts();
    showStatus('✅ Đã xóa sản phẩm.', 'success');
  } catch (error) {
    if (deleted) {
      showStatus('Đã xóa nhưng chưa tải lại được danh sách. Bấm Tải lại dữ liệu.', 'error');
    } else {
      showStatus(`Không xóa được: ${error.message}`, 'error');
    }
  } finally {
    workspace.disabled = false;
  }
}

// =========================================================
// KHỞI ĐỘNG
// =========================================================
document.querySelector('#reload').addEventListener('click', refreshProducts);
refreshProducts(); // GET ngay khi mở trang.
