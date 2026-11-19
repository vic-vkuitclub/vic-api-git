# VIC API & Git Lab

Bộ bài thực hành Node.js để làm quen với HTTP API, Supabase và Git. Có ba khu vực: trang chủ tổng, phòng mô phỏng API chỉ dùng dữ liệu giả, và trang hướng dẫn để mỗi học viên tự hoàn thành backend cùng frontend của mình.

## Cài và chạy bằng một file

Tải hoặc clone **toàn bộ project**, giải nén nếu cần, rồi giữ `setup.cmd` tại thư mục gốc. Khi gửi ZIP cho thành viên, phải bao gồm `config/public-config.enc.json`, `config/load-config.mjs` và thư mục ẩn `.lab/` chứa `config.key`. Không cần gửi `node_modules/` hoặc `.tools/`.

**Windows:** nhấp đúp `setup.cmd`. Hoặc mở PowerShell tại thư mục project và chạy:

```powershell
.\setup.cmd
```

**macOS / Linux:** mở Terminal tại thư mục project và chạy:

```sh
sh setup.cmd
```

Một file này tự thực hiện:

1. Kiểm tra Node.js >=22 và npm. Nếu chưa có bản phù hợp, tải Node.js 22 kèm npm từ `nodejs.org`, kiểm tra SHA-256 và giải nén vào `.tools/node/` trong project. Bản Node cài sẵn trên máy được giữ nguyên.
2. Cài Express, Supabase SDK và các dependencies theo `package-lock.json` bằng `npm ci`.
3. Khởi động server. Mở **http://localhost:3000**; giữ cửa sổ chạy, bấm **Ctrl+C** để dừng. Chạy lại file để cài lại dependencies và mở server lần nữa.

Cần Internet để tải Node/dependencies. Script dùng PowerShell có sẵn trên Windows; macOS/Linux cần `curl`, `tar` và `shasum` hoặc `sha256sum`. Hỗ trợ x64/arm64 với hệ điều hành còn chạy được Node.js 22. Không cần quyền quản trị khi tải runtime vào project.

**Git cho phần thực hành:** script kiểm tra và nhắc nếu thiếu Git; Git được cài riêng từ [trang chính thức](https://git-scm.com/downloads). Việc chạy web chỉ cần Node/npm và dependencies ở trên. Trình soạn thảo như VS Code/Agent tùy học viên lựa chọn.

Nếu file báo lỗi:

- Thiếu config: lấy lại bản project đầy đủ từ người tổ chức, bao gồm `.lab/`; không tự tạo env.
- Tải xuống hoặc `npm ci` lỗi: kiểm tra Internet/proxy, đọc lỗi trong Terminal rồi chạy lại file.
- Port 3000 đang được dùng: dừng server cũ trước khi chạy lại.
- Node vừa tải không chạy được: kiểm tra phiên bản hệ điều hành theo [hướng dẫn Node.js](https://nodejs.org/en/download).

Nếu script tải Node vào `.tools/`, đường dẫn Node/npm chỉ được áp dụng trong phiên script. Muốn dùng lệnh `npm run member` ở Terminal khác, thêm đường dẫn local như bên dưới hoặc cài Node.js >=22 trên máy.

macOS/Linux:

```sh
export PATH="$PWD/.tools/node/bin:$PATH"
npm run member -- ten-cua-ban
```

Windows PowerShell:

```powershell
$env:PATH = "$PWD\.tools\node;$env:PATH"
npm.cmd run member -- ten-cua-ban
```

Sau khi tạo bài, dừng server cũ rồi chạy lại `setup.cmd` để gallery nhận bài mới.

## Chạy local khi đã có Node.js

Yêu cầu Node.js 22 trở lên.

```sh
npm ci
npm start
```

Mở http://localhost:3000. Các trang chính:

- `/` — trang chủ và danh sách bài đọc từ `codeapi/<slug>/`.
- `/simulation/` — mô phỏng GET/POST/PUT/PATCH/DELETE. Chỉ đổi state trong browser; không gửi request đến Supabase.
- `/practice/` — đề bài một giờ, database schema, API contract, Git flow và hướng dẫn dùng Agent.

Tạo bộ khung bài mới trước khi chạy server:

```sh
npm run member -- ten-cua-ban
npm start
```

Mỗi bài được tạo trong `codeapi/<slug>/`; slug chỉ dùng cho thư mục và URL, không tách dữ liệu. Server quét và mount bài lúc khởi động: nếu thêm folder hoặc sửa backend khi server đang chạy, hãy restart server. Tải lại trang chủ chỉ làm mới danh sách đã mount, không nạp backend mới.

## Supabase trong bài thật

Backend đọc cấu hình bằng `loadPublicConfig()` ở `config/load-config.mjs`. Bản lab dùng `config/public-config.enc.json` và `.lab/config.key`; giữ cả hai đúng vị trí khi clone/đóng gói. Không tạo `.env` hay file plaintext, không đưa cấu hình ra frontend. Cấu hình được che nội dung để tránh tò mò; publishable key vẫn là thông tin công khai, không phải secret. Không dùng service_role, secret key hoặc mật khẩu database.

Đọc kết nối chỉ bằng một truy vấn giới hạn một dòng:

```sh
npm run check:supabase
```

Lệnh này chỉ `SELECT id FROM products LIMIT 1`, không sửa data/schema/quyền. Không chạy lại SQL grants/RLS từ lúc khởi tạo lab. Tất cả bài thành viên cùng đọc/ghi `public.products`; thay đổi của người khác được thấy khi gọi GET lại. Không dùng project này cho dữ liệu riêng tư/production. Khi lab kết thúc, người tổ chức đóng quyền lab trên Supabase.

Template backend trả HTTP 501 với TODO cho tới khi học viên tự viết handler; frontend có TODO cho các hàm fetch. Đây là phần học viên phải hoàn thiện, không phải API CRUD chạy sẵn.

## Cấu trúc

```text
server/                  Express server và Supabase client dùng chung
assets/                  Token và UI dùng chung
simulation/              API giả chạy hoàn toàn trong trình duyệt
practice/                Đề và hướng dẫn thực hành
templates/member/        Scaffold TODO chưa xuất hiện trong gallery
codeapi/<slug>/          Bài thành viên: public/ và backend/
config/                  Loader và cấu hình mã hóa
.lab/                    Khóa để mở cấu hình lab; cần đi cùng repo
docs/                    Kế hoạch bài và hướng dẫn Supabase
```

Các thư mục bài MySQL cũ trong repo được giữ nguyên làm tài liệu lịch sử; bài mới dùng Node.js và Supabase.

## Quy tắc quan trọng

- Chỉ phục vụ trang tổng, `assets/`, `simulation/`, `practice/` và `public/` của từng bài. Không static-serve toàn repo, config, key, backend hay source server.
- Không lọc products theo thành viên. Không tự seed/reset, đổi schema hoặc quyền database.
- Không deploy, push hoặc merge tự động.
- Đọc `AGENTS.md` trước khi cùng Agent sửa code; xem `config/README.md` về cấu hình và đóng gói.
