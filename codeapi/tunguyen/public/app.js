const form = document.querySelector('#product-form');
const dialog = document.querySelector('#product-dialog');
const statusMessage = document.querySelector('#app-status');
const tableBody = document.querySelector('#product-list');
const formatter = new Intl.NumberFormat('vi-VN');

async function request(path, options = {}) {
  const response = await fetch(path, options);
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  return data;
}

function fetchProducts() { return request('./api/products'); }
function createProduct(product) {
  return request('./api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
}
function updateProduct(id, changes) {
  return request(`./api/products/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
}
function deleteProduct(id) {
  return request(`./api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

function renderProducts(products) {
  tableBody.replaceChildren();
  document.querySelector('#empty-state').hidden = products.length > 0;
  document.querySelector('.table-wrap').hidden = products.length === 0;
  for (const product of products) {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.className = 'product-name';
    name.textContent = product.name;
    const id = document.createElement('td');
    const idTag = document.createElement('span');
    idTag.className = 'product-id';
    idTag.textContent = `#${product.id}`;
    id.append(idTag);
    const price = document.createElement('td');
    price.className = 'price';
    price.textContent = `${formatter.format(product.price)} ₫`;
    const stock = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `stock-badge${product.stock < 5 ? ' low' : ''}`;
    const dot = document.createElement('i');
    badge.append(dot, document.createTextNode(`${formatter.format(product.stock)} sản phẩm`));
    stock.append(badge);
    const actions = document.createElement('td');
    actions.className = 'row-actions';
    const edit = document.createElement('button');
    edit.className = 'row-button'; edit.type = 'button'; edit.textContent = 'Sửa';
    edit.addEventListener('click', () => openEdit(product));
    const remove = document.createElement('button');
    remove.className = 'row-button delete'; remove.type = 'button'; remove.textContent = 'Xóa';
    remove.addEventListener('click', () => removeProduct(product));
    actions.append(edit, remove);
    row.append(name, id, price, stock, actions);
    tableBody.append(row);
  }
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  document.querySelector('#total-products').textContent = formatter.format(products.length);
  document.querySelector('#total-stock').textContent = formatter.format(totalStock);
  document.querySelector('#total-value').textContent = `${formatter.format(totalValue)} ₫`;
  document.querySelector('#result-count').textContent = `${formatter.format(products.length)} sản phẩm`;
}

async function loadProducts() {
  const refresh = document.querySelector('#refresh-products');
  refresh.disabled = true;
  statusMessage.className = 'status';
  statusMessage.textContent = 'Đang đồng bộ sản phẩm…';
  try {
    const products = await fetchProducts();
    if (!Array.isArray(products)) throw new Error('Dữ liệu API không đúng định dạng danh sách.');
    renderProducts(products);
    statusMessage.textContent = `${formatter.format(products.length)} sản phẩm đã được đồng bộ.`;
  } catch (error) {
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
    document.querySelector('#result-count').textContent = 'Không thể đồng bộ dữ liệu';
  } finally {
    refresh.disabled = false;
  }
}

function openCreate() {
  form.reset();
  document.querySelector('#editing-id').value = '';
  document.querySelector('#form-title').textContent = 'Thêm sản phẩm';
  document.querySelector('#save-product').textContent = 'Lưu sản phẩm';
  document.querySelector('#form-error').textContent = '';
  dialog.showModal();
  document.querySelector('#name').focus();
}

function openEdit(product) {
  document.querySelector('#editing-id').value = product.id;
  document.querySelector('#form-title').textContent = 'Cập nhật sản phẩm';
  document.querySelector('#save-product').textContent = 'Lưu thay đổi';
  document.querySelector('#form-error').textContent = '';
  document.querySelector('#name').value = product.name;
  document.querySelector('#price').value = product.price;
  document.querySelector('#stock').value = product.stock;
  dialog.showModal();
  document.querySelector('#name').focus();
}

async function removeProduct(product) {
  if (!window.confirm(`Xóa “${product.name}” khỏi danh sách sản phẩm dùng chung?`)) return;
  statusMessage.className = 'status';
  statusMessage.textContent = 'Đang xóa sản phẩm…';
  try {
    await deleteProduct(product.id);
    await loadProducts();
    statusMessage.textContent = 'Đã xóa sản phẩm và đồng bộ danh sách.';
  } catch (error) {
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
  }
}

document.querySelector('#show-create').addEventListener('click', openCreate);
document.querySelector('#empty-create').addEventListener('click', openCreate);
document.querySelector('#refresh-products').addEventListener('click', loadProducts);
document.querySelector('#close-form').addEventListener('click', () => dialog.close());
document.querySelector('#cancel-form').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const saveButton = document.querySelector('#save-product');
  const errorMessage = document.querySelector('#form-error');
  const id = document.querySelector('#editing-id').value;
  const product = {
    name: document.querySelector('#name').value.trim(),
    price: Number(document.querySelector('#price').value),
    stock: Number(document.querySelector('#stock').value),
  };
  errorMessage.textContent = '';
  saveButton.disabled = true;
  saveButton.textContent = 'Đang lưu…';
  try {
    if (id) await updateProduct(id, product);
    else await createProduct(product);
    dialog.close();
    form.reset();
    await loadProducts();
    statusMessage.textContent = id ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.';
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = id ? 'Lưu thay đổi' : 'Lưu sản phẩm';
  }
});

loadProducts();
