# Bài cá nhân Thưởng — CRUD products

Bài thực hành cá nhân CRUD sản phẩm (`public.products`) theo hợp đồng API của VIC API & Git Lab.

## Chạy

Chạy server chung từ thư mục gốc của project (`npm start` hoặc `setup.cmd`). Nếu server đang chạy, hãy restart để mount bài mới.

Mở **http://localhost:3000/codeapi/thuong/**.

## Cấu trúc

- `public/index.html`: giao diện form thêm/sửa, nút tải lại và bảng sản phẩm.
- `public/style.css`: kiểu dáng cho trang.
- `public/app.js`: bốn hàm `fetch` (GET, POST, PATCH, DELETE), render bảng và xử lý sự kiện.
- `backend/routes.js`: bốn route Express validate input và thao tác `public.products` qua Supabase.

## Hợp đồng API

| Method | Endpoint | Thành công |
| --- | --- | --- |
| GET | `/codeapi/thuong/api/products` | 200, mảng products |
| POST | `/codeapi/thuong/api/products` | 201, sản phẩm mới |
| PATCH | `/codeapi/thuong/api/products/:id` | 200, sản phẩm sau sửa |
| DELETE | `/codeapi/thuong/api/products/:id` | 204, không có body |
