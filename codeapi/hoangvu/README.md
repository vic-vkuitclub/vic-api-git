# Bài Hoàng Vũ — CRUD products (giao diện card grid dark mode)

Bài thực hành CRUD đầy đủ của **Hoàng Vũ**. Backend giống bài mẫu Bằng; frontend thiết kế lại hoàn toàn theo dạng **card grid dark mode** với modal sửa riêng biệt.

## Chạy

Chạy server chung từ thư mục gốc: `npm start`. Mở **http://localhost:3000/codeapi/hoangvu/**.

> Nếu server đang chạy, hãy **restart** để nó nhận bài mới.

## Cấu trúc

```
codeapi/hoangvu/
├── backend/
│   └── routes.js        ← 4 route Express: GET/POST/PATCH/DELETE
└── public/
    ├── index.html       ← Sidebar + form thêm + card grid + modal sửa
    ├── style.css        ← Dark mode card grid, modal animation
    └── app.js           ← Fetch API, render card, modal logic
```

## Đọc code theo thứ tự

1. `public/index.html` — layout sidebar, form thêm, card grid, và modal sửa.
2. `public/app.js` — 4 hàm fetch GET/POST/PATCH/DELETE, render card, xử lý modal.
3. `backend/routes.js` — 4 route Express, validate input trước khi truy vấn Supabase.

Luồng: **browser → ./api/products → backend Hoàng Vũ → Supabase → JSON → render card**.

## API Contract

| Method | Endpoint | Thành công |
|---|---|---|
| GET | `/codeapi/hoangvu/api/products` | 200, mảng products |
| POST | `/codeapi/hoangvu/api/products` | 201, sản phẩm mới |
| PATCH | `/codeapi/hoangvu/api/products/:id` | 200, sản phẩm sau sửa |
| DELETE | `/codeapi/hoangvu/api/products/:id` | 204, không có body |

POST nhận `{ "name": "Áo thun VIC", "price": 150000, "stock": 20 }`. PATCH nhận ít nhất một trong ba trường. Lỗi trả về dạng `{ "error": { "code": "...", "message": "..." } }`.

## Điểm khác biệt so với bài mẫu Bằng

| | Bằng (mẫu) | Hoàng Vũ |
|---|---|---|
| Giao diện | Bảng HTML | **Card grid** nhiều cột |
| Sửa | Form inline | **Modal popup** riêng |
| Layout | 1 cột | Sidebar + main content |
| Theme | Mặc định | **Dark mode** tùy chỉnh |
| Trạng thái | Text thuần | Badge màu xanh/đỏ |
| Animation | Không có | Card slide-in, modal fade+slide |

## Dùng thử

- Mở trang: tự GET danh sách; nút **Tải lại** lấy trạng thái mới của cả lớp.
- Nhập tên, giá, tồn kho rồi **Lưu sản phẩm**: POST. Card mới xuất hiện trong grid.
- Bấm **✏️ Sửa** trên card: mở modal điền lại; **Lưu thay đổi** gửi PATCH.
- Bấm **🗑️ Xóa**: xác nhận rồi DELETE; sau mỗi lần ghi thành công, GET lại.

**Dữ liệu thật dùng chung cả CLB.** Không seed/reset, không xóa hàng loạt, không sửa schema/quyền.
