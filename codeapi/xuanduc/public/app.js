const form = document.querySelector('#product-form');
const statusMessage = document.querySelector('#app-status');

// Gửi request đến backend, đọc JSON khi có body và chuyển response lỗi thành Error dễ hiển thị.
async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  }
  return payload;
}

// Lấy danh sách sản phẩm từ API và kiểm tra response có đúng là một mảng hay không.
async function fetchProducts() {
  const products = await requestJson('./api/products');
  if (!Array.isArray(products)) throw new Error('API trả về danh sách sản phẩm không hợp lệ.');
  return products;
}

// Gửi dữ liệu sản phẩm mới bằng POST và trả về sản phẩm backend vừa tạo.
async function createProduct(product) {
  return requestJson('./api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

// Gửi các trường cần sửa bằng PATCH cho sản phẩm có id tương ứng.
async function updateProduct(id, changes) {
  return requestJson(`./api/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
}

// Xóa sản phẩm theo id, xử lý response 204 không có JSON body.
async function deleteProduct(id) {
  return requestJson(`./api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Vẽ danh sách nhận từ API vào bảng, đồng thời tạo nút sửa và xóa cho mỗi dòng.
function renderProducts(products) {
  const body = document.querySelector('#products-body');
  body.replaceChildren();
  if (products.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'empty-row';
    cell.textContent = 'Chưa có sản phẩm.';
    row.append(cell);
    body.append(row);
    return;
  }

  for (const product of products) {
    const row = document.createElement('tr');
    for (const value of [product.id, product.name, Number(product.price).toLocaleString('vi-VN'), product.stock]) {
      const cell = document.createElement('td');
      cell.textContent = String(value);
      row.append(cell);
    }
    const actions = document.createElement('td');
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'text-button';
    edit.textContent = 'Sửa';
    edit.addEventListener('click', () => openEditForm(product));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'text-button';
    remove.textContent = 'Xóa';
    remove.addEventListener('click', () => removeProduct(product));
    actions.append(edit, document.createTextNode(' · '), remove);
    row.append(actions);
    body.append(row);
  }
}

// Điền dữ liệu sản phẩm vào form và chuyển form sang chế độ chỉnh sửa.
function openEditForm(product) {
  document.querySelector('#editing-id').value = product.id;
  document.querySelector('#form-title').textContent = `Sửa sản phẩm #${product.id}`;
  document.querySelector('#name').value = product.name;
  document.querySelector('#price').value = product.price;
  document.querySelector('#stock').value = product.stock;
  form.hidden = false;
  document.querySelector('#name').focus();
}

// Hỏi xác nhận trước khi xóa, rồi gọi API và tải lại danh sách mới nhất.
async function removeProduct(product) {
  if (!window.confirm(`Xóa sản phẩm “${product.name}” (#${product.id})?`)) return;
  statusMessage.className = 'status';
  statusMessage.textContent = 'Đang xóa sản phẩm…';
  try {
    await deleteProduct(product.id);
    await loadProducts('Đã xóa sản phẩm.');
  } catch (error) {
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
  }
}

// Tải lại danh sách, cập nhật trạng thái tải/lỗi và khóa nút refresh trong lúc chờ.
async function loadProducts(successMessage) {
  const refreshButton = document.querySelector('#refresh-products');
  refreshButton.disabled = true;
  statusMessage.className = 'status';
  statusMessage.textContent = 'Đang tải…';
  try {
    const products = await fetchProducts();
    renderProducts(products);
    statusMessage.textContent = successMessage || `${products.length} sản phẩm đã tải.`;
  } catch (error) {
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
  } finally {
    refreshButton.disabled = false;
  }
}

document.querySelector('#refresh-products').addEventListener('click', loadProducts);
document.querySelector('#show-create').addEventListener('click', () => {
  document.querySelector('#editing-id').value = '';
  document.querySelector('#form-title').textContent = 'Thêm sản phẩm';
  form.hidden = false;
  document.querySelector('#name').focus();
});
document.querySelector('#close-form').addEventListener('click', () => { form.hidden = true; });
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const product = {
    name: document.querySelector('#name').value,
    price: Number(document.querySelector('#price').value),
    stock: Number(document.querySelector('#stock').value),
  };
  const submitButton = form.querySelector('button[type="submit"]');
  const editingId = document.querySelector('#editing-id').value;
  submitButton.disabled = true;
  try {
    if (editingId) await updateProduct(editingId, product);
    else await createProduct(product);
    form.reset();
    document.querySelector('#editing-id').value = '';
    form.hidden = true;
    await loadProducts(editingId ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm.');
  } catch (error) {
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

loadProducts();
