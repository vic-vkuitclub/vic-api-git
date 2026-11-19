const form = document.querySelector('#product-form');
const statusMessage = document.querySelector('#app-status');

function unfinished(feature) {
  throw new Error(`TODO: học viên tự triển khai ${feature}.`);
}

// TODO: viết fetch GET đến ./api/products, kiểm tra response.ok và trả về mảng products.
async function fetchProducts() {
  return unfinished('fetchProducts');
}

// TODO: viết fetch POST đến ./api/products và gửi { name, price, stock } dạng JSON.
async function createProduct(_product) {
  return unfinished('createProduct');
}

// TODO: viết fetch PATCH đến ./api/products/:id và gửi các trường cần cập nhật.
async function updateProduct(_id, _changes) {
  return unfinished('updateProduct');
}

// TODO: viết fetch DELETE đến ./api/products/:id; response 204 không có JSON body.
async function deleteProduct(_id) {
  return unfinished('deleteProduct');
}

// TODO: render dữ liệu API vào tbody; hiển thị trạng thái rỗng và nút sửa/xóa.
function renderProducts(_products) {
  unfinished('renderProducts');
}

async function loadProducts() {
  // TODO: khóa nút tải lại khi đang chờ, rồi mở lại trong finally.
  statusMessage.className = 'status';
  statusMessage.textContent = 'Đang tải…';
  try {
    const products = await fetchProducts();
    renderProducts(products);
    statusMessage.textContent = `${products.length} sản phẩm đã tải.`;
  } catch (error) {
    statusMessage.className = 'status error';
    statusMessage.textContent = error.message;
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
  try {
    // TODO: đọc #editing-id; gọi updateProduct khi đang sửa, createProduct khi tạo mới.
    // TODO: chỉ đóng/reset form sau khi thành công, giữ input nếu request lỗi.
    throw new Error('TODO: học viên tự hoàn thiện thao tác submit tạo/sửa.');
  } catch (error) { statusMessage.className = 'status error'; statusMessage.textContent = error.message; }
});

// TODO: khi renderProducts tạo nút hành động, nối Sửa để điền form + editing-id.
// TODO: nối Xóa với window.confirm(), deleteProduct(id), rồi gọi loadProducts().
// TODO: xử lý loading/disabled và lỗi cho từng thao tác; không báo thành công trước response.

// TODO: gọi loadProducts() khi trang mở để tải dữ liệu ban đầu.
