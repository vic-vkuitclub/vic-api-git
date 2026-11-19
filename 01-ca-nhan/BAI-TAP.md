# Cá nhân — API cửa hàng

Import database/setup.sql bằng MySQL Workbench hoặc trình quản lý database. Script tạo 3 danh mục, 6 sản phẩm. Chỉ import một lần; chạy lại sẽ báo bảng đã tồn tại.
Tạo backend trong thư mục backend/ bằng stack đã thống nhất. Ghi cách chạy trong README của bài nộp.

## Lượt 1: Danh mục (30–45 phút, chưa tính cài môi trường)
- GET /api/categories: danh sách, sắp xếp id tăng dần.
- GET /api/categories/1: chi tiết; id không có trả 404.
- POST /api/categories, body {"name":"Văn phòng phẩm"}: lưu và trả 201.
- PATCH /api/categories/{id}, body {"name":"Danh mục mới"}: sửa tên.
- DELETE /api/categories/{id}: 204; nếu còn sản phẩm, trả 409.
name bắt buộc, trim, không rỗng, tối đa 100 ký tự; tên trùng trả 409. ID đường dẫn phải là số nguyên dương, sai trả 400.
Response danh mục: {"id":1,"name":"Đồ uống"}.

## Lượt 2: Sản phẩm (45–60 phút)
- GET /api/products: danh sách theo id tăng dần.
- GET /api/products?categoryId=1: lọc danh mục; không có kết quả trả 200 và [].
- GET /api/products/{id}: chi tiết.
- POST /api/products, body {"categoryId":1,"name":"Trà chanh","price":15000,"stock":12}.
- PATCH /api/products/{id}: chỉ gửi các trường muốn sửa trong bốn trường trên; body rỗng trả 400.
- DELETE /api/products/{id}: 204.
Tên bắt buộc, trim, tối đa 150 ký tự. price và stock là số nguyên không âm; categoryId là số nguyên dương. Danh mục được tham chiếu không tồn tại trả 404. Query categoryId sai định dạng trả 400. Sản phẩm không tồn tại trả 404.
Response sản phẩm dùng camelCase: {"id":1,"categoryId":1,"name":"Trà đào","price":25000,"stock":20}. Giá tính bằng VND. Database dùng category_id, API dùng categoryId.

## Kiểm tra và nộp
1. Thử GET, tạo mới, GET lại, sửa, GET lại, xóa và GET lại để xác nhận 404.
2. Thử tên rỗng, giá âm, danh mục không tồn tại, xóa danh mục đang có sản phẩm.
3. Restart backend và xác nhận dữ liệu đã tạo còn tồn tại.
4. Nộp source, hướng dẫn chạy và collection Postman do bản thân tạo, kèm mã trạng thái mong đợi/thực tế.
5. Tự trình bày luồng request → xử lý → database → response.

Bài thêm: PUT thay thế toàn bộ các trường được phép sửa của sản phẩm. Không bắt buộc để qua bài nhóm.
