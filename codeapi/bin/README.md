# Bài mẫu Bin — CRUD products cơ bản

Đây là bài mẫu hoàn chỉnh được người tổ chức yêu cầu, dùng để đọc và đối chiếu. Template dành cho học viên khác vẫn giữ TODO.

## Chạy

Chạy server chung từ thư mục gốc theo README của project: `npm start` nếu đã có Node/dependencies, hoặc chạy `setup.cmd`. Nếu server đang chạy, hãy restart để mount bài mới.

Mở **http://localhost:3000/codeapi/bin/**. Bài này tự xuất hiện trên trang chủ sau khi server khởi động.

## Đọc code theo thứ tự

1. `public/index.html`: bố cục hai cột: form bên trái, danh sách bên phải; mobile xếp dọc.
2. `public/app.js`: bốn hàm fetch GET/POST/PATCH/DELETE được viết riêng, sau đó là render và các sự kiện.
3. `backend/routes.js`: bốn route Express; validate input trước khi truy vấn Supabase.

Luồng: **browser → ./api/products → backend Bin → Supabase → JSON → render bảng**.

| Method | Endpoint | Thành công |
| --- | --- | --- |
| GET | `/codeapi/bin/api/products` | 200, mảng products |
| POST | `/codeapi/bin/api/products` | 201, sản phẩm mới |
| PATCH | `/codeapi/bin/api/products/:id` | 200, sản phẩm sau sửa |
| DELETE | `/codeapi/bin/api/products/:id` | 204, không có body |

POST nhận `{ "name": "Trà vải", "price": 22000, "stock": 12 }`. PATCH nhận ít nhất một trong ba trường này. Form mẫu gửi cả ba trường khi sửa cho dễ đọc. Backend từ chối trường lạ, tên rỗng, số dạng chuỗi, số thập phân, giá/tồn kho ngoài 0–2.147.483.647. ID sai trả 400, ID không tồn tại khi sửa/xóa trả 404, lỗi database trả 500 với thông báo chung.

ID do DB cấp; category_id được backend gán từ context.LAB_CATEGORY_ID; response ánh xạ thành categoryId. Không có env/config riêng.

## Dùng thử

- Mở trang: tự GET danh sách; nút Tải lại lấy trạng thái mới của cả lớp.
- Nhập tên, giá, tồn kho rồi Lưu: POST. Bấm Sửa trên hàng: điền lại form; Lưu gửi PATCH.
- Bấm Xóa: xác nhận rồi DELETE; sau mỗi lần ghi thành công, GET lại.
- Khi request thất bại, hiện lỗi và giữ input; khi đã lưu/xóa nhưng GET sau đó thất bại, thông báo rõ để tránh gửi ghi lần nữa.

**Dữ liệu thật dùng chung cả CLB.** Chỉ thử từng bản ghi đã thống nhất. Không seed/reset, không xóa hàng loạt, không sửa schema/quyền. Chạy server không tự ghi DB; chỉ nút Lưu/Xóa mới gửi mutation.

Phạm vi mẫu chỉ GET danh sách, POST, PATCH, DELETE; chưa thêm GET chi tiết, PUT, tìm kiếm hoặc realtime.
