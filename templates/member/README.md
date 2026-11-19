# Bài thực hành products · `{{SLUG}}`

Đường dẫn trang: `/codeapi/{{SLUG}}/`  
API base: `/codeapi/{{SLUG}}/api`

## Yêu cầu chính

Tự hoàn thành GET danh sách, POST, PATCH và DELETE cho `public.products`. GET chi tiết, PUT và tìm kiếm là phần mở rộng.

## Việc cần tự hoàn thành

- `backend/routes.js`: tự viết validation và handler GET danh sách/POST/PATCH/DELETE qua `context.getSupabase()`.
- `public/app.js`: tự viết các hàm fetch đến backend cùng origin; kiểm tra HTTP status và xử lý lỗi; sau mỗi mutation gọi GET lại.
- Tự hoàn thiện TODO tải dữ liệu khi mở trang, render bảng và trạng thái rỗng.
- Khi submit, phân biệt tạo/sửa theo `editing-id`; thêm nút sửa/xóa khi render bảng.
- Xác nhận trước khi xóa; xử lý trạng thái loading, lỗi, giữ input khi lỗi và không báo thành công trước response.
- Không gọi Supabase trực tiếp từ browser. Không dùng mock/localStorage trong bài thật.

## Dữ liệu chung

Mọi bài thành viên dùng chung bảng products, không gắn owner/member id và không lọc theo slug. Người khác có thể thay đổi hoặc xóa sản phẩm trong lúc bạn đang làm. GET lại trước khi xử lý lỗi 404.

Backend nhận context có `getSupabase()` và `LAB_CATEGORY_ID`. Cấu hình được loader chung giải mã từ `config/public-config.enc.json` và `.lab/config.key`; không đưa giá trị cấu hình vào frontend hoặc log. Response API dùng `categoryId`; cột lưu trong database là `category_id`. `price` và `stock` phải là số nguyên từ 0 đến 2.147.483.647. Xem `/practice/` để biết schema và API contract.

Scaffold hiện trả 501 cho endpoint chưa hoàn thành. Khi làm xong, xác minh status/body rồi đọc code và giải thích được quyết định của mình.
