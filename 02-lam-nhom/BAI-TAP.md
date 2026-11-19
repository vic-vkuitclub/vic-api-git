# Nhóm — Trang sự kiện VIC

Mục tiêu: một người viết API, hai người làm hai giao diện, tích hợp bằng Git. Import database/setup.sql riêng trên từng máy cần chạy backend; Git không đồng bộ dữ liệu đang nằm trong MySQL.

## Phân việc
| Người | Phần việc | File/thư mục sở hữu | Branch |
|---|---|---|---|
| A | API sự kiện và đăng ký | backend/ | feature/events-api |
| B | Danh sách, chi tiết sự kiện | frontend/events.html, frontend/events.js | feature/events-page |
| C | Form đăng ký, thông báo kết quả | frontend/register.html, frontend/register.js | feature/register-page |
| D nếu có | Khung giao diện, tích hợp, kiểm thử | frontend/styles.css, frontend/api.js, docs/ | feature/integration |

Nhóm 3 người: A kiêm frontend/api.js, B kiêm CSS, C kiểm thử luồng hoàn chỉnh.

## API thống nhất trước khi code
- GET /api/events → mảng sự kiện, 200, theo id tăng dần.
- GET /api/events/{id} → một sự kiện, 200 hoặc 404.
- POST /api/registrations, body {"eventId":1,"fullName":"Nguyễn Văn A","email":"a@example.com"} → đăng ký vừa lưu, 201.
- GET /api/events/{id}/registrations → danh sách đăng ký, 200; sự kiện không có trả 404. Dùng Postman kiểm tra, giao diện quản lý là bài thêm.

Sự kiện: {"id":1,"title":"Workshop Git","description":"Thực hành phối hợp dự án","eventDate":"2026-12-05","location":"Phòng sinh hoạt VIC","isOpen":true}.
Đăng ký: {"id":3,"eventId":1,"fullName":"Nguyễn Văn A","email":"a@example.com"}.
Ngày trả chuỗi YYYY-MM-DD, isOpen trả boolean. Tên biến JSON khác tên cột SQL phải được ánh xạ.

Validation: eventId nguyên dương; fullName trim, không rỗng, tối đa 100 ký tự; email trim, chuyển chữ thường, có định dạng email, tối đa 150 ký tự. Dữ liệu sai trả 400; sự kiện không có trả 404; đóng đăng ký hoặc trùng email trong cùng sự kiện trả 409. Hai sự kiện khác nhau được dùng cùng email. Không tự đóng theo ngày trong bài này.
Không yêu cầu đăng nhập trong bài lab cục bộ.

## Giao diện
B: danh sách, bấm xem chi tiết; nút đăng ký chuyển sang register.html?eventId=1. Có trạng thái tải, rỗng, lỗi.
C: đọc eventId từ URL, hiển thị tên sự kiện, nhập tên/email, gửi POST; chỉ báo thành công sau response 201; hiện lỗi server phù hợp.
Hai giao diện dùng cùng frontend/api.js, có base URL tập trung. Backend cấu hình CORS cho origin frontend đã thống nhất. Chạy frontend qua HTTP, dùng cùng origin/port khi demo.

## Làm song song
Chốt mẫu JSON và tên hàm getEvents(), getEvent(id), createRegistration(data) trước. B/C có thể dùng fixture từ mẫu JSON để dựng giao diện; khi demo phải chuyển sang API thật. A ưu tiên hoàn thành hai GET trước rồi POST. Mỗi máy có thể chạy backend cục bộ cùng code; nếu dùng backend máy A qua LAN, dùng IP máy A, không dùng localhost của máy B/C.

## Quy trình Git
1. Nhóm trưởng tạo repo và commit khung thư mục, hợp đồng API, file dùng chung trước.
2. Mỗi người clone, cập nhật main rồi tạo nhánh riêng.
3. Commit rõ ý, push và mở PR vào main; không push trực tiếp main.
4. Mỗi PR được một người khác chạy thử và review. A merge API trước; B/C hoàn tất tích hợp rồi merge.
5. Trước merge khi main đã đổi: commit công việc, git fetch origin, git merge origin/main trên nhánh tính năng; xử lý conflict, chạy thử rồi push.
6. Cả nhóm pull main và demo trọn luồng xem sự kiện → đăng ký → xác nhận dữ liệu trong database.

## Nghiệm thu
- Có đóng góp và PR riêng của từng thành viên.
- API và hai giao diện chạy với nhau, không còn dữ liệu fixture trong luồng demo.
- Đăng ký thành công còn dữ liệu sau restart backend.
- Thử email sai, đăng ký trùng và sự kiện đóng.
- README ghi cách import DB, chạy backend/frontend và cấu hình kết nối.
- Bài thêm: hai nhánh sửa cùng dòng README, cùng giải quyết merge conflict.
