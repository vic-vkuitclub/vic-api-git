# Cấu hình lab

Cấu hình đã được mã hóa để không đọc ngay được khi mở file. Khóa đi kèm repo;
đây là cách che nội dung cho bài lab, không phải nơi lưu secret/service_role.

Các file cần đi cùng nhau khi clone hoặc deploy:

- `config/public-config.enc.json`: cấu hình mã hóa AES-256-GCM.
- `.lab/config.key`: khóa trong thư mục ẩn tại gốc repo; cố ý được đưa vào Git.
- `config/load-config.mjs`: hàm đọc cấu hình, chỉ dùng ở backend Node.js.

Backend lấy cấu hình bằng:

```js
import { loadPublicConfig } from '../config/load-config.mjs';

const config = loadPublicConfig();
// Dùng config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY,
// config.LAB_CATEGORY_ID trong backend; không log hoặc gửi config ra frontend.
```

Điều chỉnh đường dẫn import theo vị trí file gọi. Loader tìm file theo vị trí
của chính nó, không phụ thuộc thư mục đang chạy lệnh. Không đọc khi import;
gọi hàm khi cần Supabase để trang mô phỏng vẫn mở nếu cấu hình bị thiếu.

Khi deploy, cần môi trường chạy Node.js và giữ nguyên vị trí cả ba file trên.
Kiểm tra công cụ đóng gói có bao gồm thư mục ẩn `.lab/`; không thêm nó vào
ignore của Git hoặc công cụ deploy. Không phục vụ các file này bằng static route.
Chỉ hosting HTML tĩnh sẽ không chạy được backend này.

`public-config.example.json` chỉ chứa ví dụ. File plaintext thật đã được thay bằng
file mã hóa và được ignore để tránh vô tình commit lại. Nếu plaintext từng nằm
trong lịch sử Git, mã hóa file hiện tại không xóa nội dung khỏi các commit cũ.

## Đổi cấu hình hoặc khóa

Chỉnh cấu hình cần tạo lại file mã hóa bằng đúng khóa, hoặc tạo mới cả khóa và
file mã hóa cùng lúc. Không sửa ciphertext bằng tay, không đổi riêng khóa.
Thành viên nhận lại cả hai file qua Git rồi restart backend; không phải điền env.

Quyền dữ liệu vẫn do grants/RLS trên Supabase quyết định. Khi kết thúc lab,
người tổ chức đóng quyền truy cập lab trên Supabase như dự kiến.
