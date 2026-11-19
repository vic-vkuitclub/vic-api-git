# Kế hoạch bài tập CLB VIC — Làm quen API và Git

> **Cập nhật mới nhất — cấu hình đã được che theo yêu cầu người tổ chức:**
> Bản phân phối dùng `config/public-config.enc.json`, khóa đi kèm ở `.lab/config.key`.
> Backend gọi `loadPublicConfig()` từ `config/load-config.mjs`; xem `config/README.md`.
> Mọi chỗ còn nhắc `config/public-config.json` bên dưới là quyết định cũ đã thay thế;
> không tạo lại plaintext hoặc yêu cầu thành viên điền env.
> Khi clone/deploy phải bao gồm cả file mã hóa và thư mục ẩn chứa khóa, giữ nguyên
> vị trí. Không yêu cầu thành viên nhập env. Khóa trong repo chỉ giúp che nội dung,
> không thay thế grants/RLS. Quy tắc mới này thay hướng dẫn lưu JSON đọc trực tiếp.

Ngày soạn: 19/11/2026. Đã xác nhận: mỗi người tự viết cả backend và frontend gọi backend; bài làm trực tiếp khoảng 60 phút, có Agent hỗ trợ. Đã chốt thêm: backend Node.js, danh mục cố định, dùng chung Supabase hiện tại và một repo có trang chủ tập hợp bài trong codeapi/<thanh-vien>/. Các chi tiết tổ chức đề xuất ở mục 8.

Đây là kế hoạch nội dung học và bài tập, không phải kế hoạch triển khai dành cho agent. Web bài tập hiện đã được dựng theo `docs/CODE_PLAN.md`; Supabase chỉ được kiểm tra bằng truy vấn SELECT giới hạn, không sửa data/schema/quyền.

## 1. Cơ sở và mục tiêu

Đã đọc README.md, hai bài tập và SQL hiện có, cùng hai tài liệu được cung cấp về API và Git.

- README hiện dùng MySQL 8.4, bài cá nhân gồm categories/products và bài nhóm chuyển sang events/registrations. Kế hoạch mới đề xuất Supabase PostgreSQL, trước mắt chỉ CRUD products, giữ categories làm dữ liệu tham chiếu; chưa sửa các đề cũ và chưa dùng SQL MySQL để import vào Supabase.
- Tài liệu API là nền tảng cho request/response, HTTP method, JSON, path/query, status code, PUT/PATCH, trạng thái tải/rỗng/lỗi và xác nhận từ server.
- Tài liệu Git là nền tảng cho working directory → staging → commit → remote, branch, PR, review và merge conflict. Ví dụ tài liệu đang xen kẽ main/develop; bài tập này thống nhất feature/* → PR → main, không cần develop.
- Thư mục hiện tại chưa có repository Git được khởi tạo. Chuẩn bị repo là việc của buổi thực hành sau, không thực hiện trong bước lập kế hoạch.

Sau bài học, mỗi thành viên cần giải thích được một lần gọi API, thử được các method cơ bản, tự làm một luồng đọc/ghi dữ liệu thật qua API và thực hiện được một vòng branch → commit → push → PR → review.

Hai phần của chương trình:

| Phần | Hoạt động chính | Dữ liệu | Kết quả học tập |
| --- | --- | --- | --- |
| 1. Phòng thử API | Thao tác request bên trái, quan sát database mô phỏng bên phải | Dữ liệu giả trong phiên học | Hiểu ý nghĩa request, response và tác động của từng method |
| 2. Quản lý sản phẩm VIC | Học viên tự code website CRUD và API theo phạm vi được chốt | Một bảng products trên Supabase | Kết nối kiến thức API với dữ liệu thật và cộng tác bằng Git |

### 1.1. Trang chủ và thư mục bài của từng thành viên

Một repository dùng chung cho cả CLB. Trang chủ tổng ở `/` gồm giới thiệu, liên kết Phòng thử API và danh sách bài thực hành của từng thành viên. Danh sách được server Node.js đọc từ các thư mục con trực tiếp trong `codeapi/`, không bắt mọi người cùng sửa danh sách trong index tổng.

Cấu trúc nội dung dự kiến (minh họa, chưa tạo file):

```text
index.html                    Trang chủ tổng
simulation/                   Phần 1: phòng thử API
codeapi/
  thuong/
    public/index.html         Giao diện bài của Thương
    public/app.js             Các hàm gọi API do Thương viết
    public/style.css
    backend/routes.js         HTTP API CRUD do Thương viết
    README.md                 Cách thử và kết quả bài cá nhân
  hung/
    public/index.html
    public/app.js
    public/style.css
    backend/routes.js
    README.md
server/                       Khung Node.js chạy chung do người hướng dẫn chuẩn bị
package.json                  Dependencies và lệnh chạy chung
config/public-config.enc.json Cấu hình public mã hóa
.lab/config.key               Khóa đi kèm repo
config/load-config.mjs        Backend loader dùng chung
AGENTS.md                     Quy ước làm bài chung sau này
docs/PLAN.md                  Tài liệu kế hoạch hiện tại
```

Tên thư mục dùng slug duy nhất: chữ thường không dấu, số hoặc dấu gạch ngang. Trùng tên thì thêm định danh, ví dụ `hung-02`. Slug dùng thống nhất cho thư mục, nhánh và đường dẫn API; không dùng để phân chia dữ liệu.

| Đường dẫn minh họa | Nội dung |
| --- | --- |
| / | Trang chủ tổng |
| /simulation/ | Phòng thử API, không dùng Supabase |
| /codeapi/thuong/ | Giao diện bài của Thương |
| /codeapi/thuong/api/products | API của Thương |
| /codeapi/hung/ | Giao diện bài của Hùng |
| /codeapi/hung/api/products | API của Hùng |

Đề xuất một tiến trình Node.js và một port chung trên mỗi máy: server gắn router và phục vụ thư mục public của từng thành viên. Các module cá nhân không tự mở thêm port. Frontend gọi đường dẫn tương đối `./api/products` từ trang có URL kết thúc bằng `/`, nhờ đó vào bài nào thì gọi backend bài đó. Không nối tất cả frontend vào một bộ CRUD có sẵn, vì mỗi người cần viết API của riêng mình.

Trang chủ đọc danh sách thư mục khi server khởi động hoặc khi tải lại danh sách, hiển thị slug/tên và liên kết tương ứng. Chỉ nhận thư mục theo quy ước có `public/index.html`; bỏ qua file/thư mục tạm. Server quét và mount registry/router lúc khởi động; `GET /api/members` trả đúng registry đã mount. Tải lại danh sách không phát hiện bài mới. Sau khi thêm folder hoặc sửa backend, phải restart server. Có thư mục không đồng nghĩa bài đã chạy đúng; trang chủ không tự đánh dấu hoàn thành. Router thiếu/hỏng phải có thông báo ở bài đó thay vì làm cả danh sách biến mất.

Chỉ phục vụ `public/` ra browser; không public toàn bộ codeapi, backend, public config hoặc mã server. Sau khi merge PR và cập nhật repo, bài mới xuất hiện qua cơ chế đọc thư mục, không cần sửa index tổng. Thư mục trên máy của thành viên khác chưa push/merge thì trang chủ máy người hướng dẫn chưa thể đọc được.

Người hướng dẫn chuẩn bị trang chủ, cơ chế đọc thư mục và server chung trước giờ; học viên tập trung vào thư mục cá nhân. Đây là yêu cầu của bộ bài tập sau này, không phải công việc đang code ở bước hiện tại.

## 2. Phần 1 — Phòng thử API trực quan

### 2.1. Cách sử dụng

Người học mở phòng thử mà không cần tài khoản hay cấu hình Supabase. Nhãn “MÔ PHỎNG — dữ liệu không được gửi đến Supabase” luôn nhìn thấy. Dùng địa chỉ ví dụ như `https://api.example.test/api`, không cho nhập URL thật để gửi request.

| Vùng | Nội dung và thao tác |
| --- | --- |
| Bên trái: soạn request | Chọn GET/POST/PUT/PATCH/DELETE; chọn đường dẫn danh sách hoặc chi tiết; nhập id; query tìm kiếm; xem Content-Type; nhập JSON body; nút Gửi và mẫu request |
| Bên trái, dưới request | Response gồm HTTP status, JSON hoặc trạng thái không có body; giải thích ngắn; lịch sử các lần thử và nút nạp lại request cũ |
| Bên phải: database giả | Bảng products, dữ liệu trước/sau request, đánh dấu hàng vừa thêm/sửa/xóa; GET chỉ đánh dấu kết quả được đọc |
| Phần giải thích chung | Luồng client → server mô phỏng → database mô phỏng → response; phân biệt response và dữ liệu toàn bảng |
| Điều khiển buổi học | Khôi phục dữ liệu mẫu, xác nhận trước reset, chọn tình huống lỗi; reset chỉ tác động dữ liệu giả |

GET có query trả danh sách đã lọc ở response, nhưng bên phải vẫn hiển thị toàn bộ database giả để học viên hiểu đọc dữ liệu không thay đổi database. Sau lỗi, database giữ nguyên. Bản ghi vừa xóa vẫn có thể xem trong ảnh trước/sau.

Trên màn hình nhỏ, hiển thị lần lượt khu vực request/response và database, giữ rõ các nhãn. Thông tin thêm/sửa/xóa có chữ mô tả, không chỉ phân biệt bằng màu.

### 2.2. Dữ liệu và hợp đồng mô phỏng

Dùng cùng mô hình products và hợp đồng dự kiến của phần 2 ở mục 4 để học viên chuyển tiếp dễ dàng. Bộ giả có khoảng 6 sản phẩm theo dữ liệu đã cung cấp; có thể đặt một sản phẩm hết hàng trong bộ giả để minh họa. Response mô phỏng dùng `categoryId` chỉ đọc; database giả có thể giữ `category_id` nội bộ. Mọi thao tác nhận ID tùy ý để thử. ID do server mô phỏng cấp, người học không tự đặt khi tạo.

- GET danh sách và chi tiết theo ID nhập tùy ý: 200; ID nguyên dương hợp lệ nhưng không tồn tại: 404; ID sai định dạng: 400.
- POST hợp lệ: 201 cùng bản ghi vừa tạo; database giả thêm hàng.
- PUT: gửi đầy đủ các trường được phép sửa; thiếu trường: 400; không tồn tại: 404. Trong bài này không dùng PUT để tạo mới.
- PATCH: gửi một hoặc nhiều trường được phép sửa; trường còn lại giữ nguyên; body rỗng: 400.
- DELETE: xóa đúng id, trả 204 và không có body; id không tồn tại: 404.
- JSON sai cú pháp, ID sai hoặc dữ liệu sai: 400; method không được hỗ trợ tại đường dẫn: 405; đường dẫn lạ: 404. `price` và `stock` là số nguyên từ 0 đến 2.147.483.647.
- Lỗi server giả: 500 và không ghi dữ liệu; tình huống mất mạng giả: không có HTTP status/response. Gắn nhãn rõ đây là lỗi được chủ động mô phỏng.

Đây là quy ước của API bài học, không phải khẳng định mọi API đều có cùng hợp đồng. Phòng thử không giả lập SQL, Supabase Auth hay toàn bộ HTTP.

### 2.3. Chuỗi thử thách — demo nhanh 8–10 phút, tự khám phá thêm sau giờ

1. **Đọc dữ liệu:** GET danh sách; GET chi tiết với ID bất kỳ; thử ID không tồn tại và ID sai định dạng.
2. **Tạo:** POST sản phẩm mới, ghi lại ID được cấp rồi GET chi tiết ID vừa tạo; thử thiếu tên, giá âm và giá lớn hơn 2.147.483.647, giải thích vì sao bảng không đổi.
3. **Sửa:** nạp thử thách PATCH `/products/2`, chỉ đổi stock và kiểm tra trường còn lại; thử ID không tồn tại.
4. **Xóa:** nạp DELETE `/products/6`, sau đó GET lại để thấy 404; thử xóa ID vừa tạo.
5. **Mở rộng:** thử PUT đầy đủ/thiếu trường và query tìm kiếm.
6. **Xử lý lỗi:** thử JSON hỏng, lỗi server và mất mạng; xác định trường hợp nào có mã HTTP.
7. **Tự giải thích:** chọn request trong lịch sử và mô tả method, path/query, body, status, response, hàng bị tác động.

Mỗi thử thách có mục tiêu, dữ liệu đầu vào gợi ý và câu hỏi dự đoán. Chỉ hiện đáp án sau khi người học thử hoặc yêu cầu xem; không chỉ chấm thao tác bấm đúng nút.

### 2.4. Tiêu chí đạt phần 1

- Học viên chỉ ra được phần nào của request xác định thao tác và phần nào xác định tài nguyên.
- Thực hiện được đủ GET, POST, PUT, PATCH, DELETE và giải thích PUT/PATCH bằng dữ liệu trước/sau.
- Phân biệt được danh sách rỗng, không tìm thấy chi tiết, lỗi validation và mất mạng.
- Mọi thao tác chỉ đổi dữ liệu giả; không cần cấu hình và không phát sinh request đến API thật. Tải lại phòng thử có thể trở về dữ liệu mẫu; quy tắc này phải được thông báo.

## 3. Phần 2 — Đề xuất bài thực hành thật cần xác nhận

### 3.1. Đề bài cho học viên

“Xây dựng trang Quản lý sản phẩm CLB VIC. Yêu cầu chính: xem danh sách, thêm, sửa và xóa sản phẩm. Mọi dữ liệu sản phẩm phải được đọc/ghi qua API và lưu trong bảng products trên Supabase. Reload trang hoặc restart backend không làm mất dữ liệu đã lưu. Xem chi tiết một sản phẩm là phần mở rộng.”

Yêu cầu chính trong một giờ là GET danh sách, POST, PATCH và DELETE trên một bảng products. GET chi tiết, PUT và tìm kiếm là bài mở rộng. Không làm chức năng danh mục, giỏ hàng, đơn hàng, upload ảnh, thanh toán, Realtime hay phân quyền nhiều vai trò. Phần 1 vẫn minh họa cả PUT và PATCH.

### 3.2. Phạm vi đã xác nhận và kiến trúc đề xuất

Người tổ chức xác nhận mỗi người đều phải tự viết backend và frontend gọi backend; không chia nhóm thành người chỉ làm frontend hoặc chỉ làm backend. Có thể nhờ Agent hỗ trợ nhưng phải hiểu và sửa được phần mình nộp.

Luồng bài: **Browser → backend học viên viết → Supabase Data API qua thư viện phía server → PostgreSQL → backend trả response → browser hiển thị.**

Supabase có REST API tự sinh, nhưng bài này vẫn yêu cầu tự xây backend HTTP API, không chỉ gọi API Supabase từ browser. [Tài liệu Data REST API](https://supabase.com/docs/guides/api).

Backend Node.js đã được người tổ chức xác nhận. Đề xuất dùng Express, frontend HTML/CSS/JavaScript thuần và thư viện Supabase phía backend. Người hướng dẫn chuẩn bị khung chạy chung, kết nối mẫu nhưng không có lời giải CRUD. Mỗi người tự viết module backend và frontend trong thư mục của mình; server chung chỉ phục vụ trang và gắn các module vào đúng đường dẫn.

Giữ schema thật có categories và foreign key. Chỉ CRUD products; categories là dữ liệu tham chiếu có sẵn, không có API/màn hình danh mục trong giờ học. Backend lấy `LAB_CATEGORY_ID` bằng `loadPublicConfig()` từ file config đã mã hóa, rồi tự gán khi tạo sản phẩm. categoryId là trường chỉ đọc trong response; học viên chỉ nhập name/price/stock. Không yêu cầu thành viên nhập env hay tạo plaintext config.

Mỗi học viên dùng bản bài của mình và cùng hợp đồng, tự làm trọn GET danh sách/POST/PATCH/DELETE; GET chi tiết, PUT và tìm kiếm là mở rộng. Người học ngồi theo cặp để hỗ trợ và review PR, không phân chia endpoint khiến một người thiếu trải nghiệm end-to-end.

### 3.3. Quy định “không xử lý data tại frontend”

Đề xuất hiểu yêu cầu này theo trách nhiệm sau và cần người tổ chức xác nhận:

| Việc | Nơi xử lý |
| --- | --- |
| Đọc input, hiển thị bảng, định dạng giá VND, mở/đóng form, trạng thái tải/lỗi | Frontend |
| Nhắc thiếu trường trước khi gửi | Frontend có thể làm để hỗ trợ người dùng; backend vẫn bắt buộc kiểm tra độc lập |
| Kiểm tra kiểu/giới hạn, chuẩn hóa tên, cấp id, chọn trường được sửa, đọc/ghi dữ liệu | Backend và ràng buộc database |
| Tìm kiếm/lọc sản phẩm khi có yêu cầu | Query gửi lên backend; backend truy vấn database, không tải toàn bộ về rồi lọc ở browser |
| Xác nhận thêm/sửa/xóa thành công | Theo response server; sau mutation gọi GET lại để đồng bộ bảng |

Không dùng mảng hardcode/localStorage làm nguồn dữ liệu bài nộp; không tự tăng id, không sửa/xóa mảng rồi coi là đã lưu, không gọi Supabase trực tiếp từ browser trong bài này. Browser được giữ bản sao response trong state để render; không thể hiển thị dữ liệu mà hoàn toàn không có state phía giao diện.

### 3.4. Giao diện học viên cần hoàn thành

- TODO tải dữ liệu ban đầu khi mở trang; hiển thị loading, rỗng và lỗi.
- TODO render bảng từ response API; không dựng dữ liệu giả.
- TODO phân biệt tạo/sửa theo trạng thái form khi submit.
- TODO xác nhận trước xóa; xử lý loading/lỗi, giữ input khi thất bại và tải lại sau mutation.
- Một trang có bảng id/tên/giá/tồn kho, nút sửa/xóa và form thêm/sửa. Nút xem chi tiết là mở rộng.
- Xóa có xác nhận; nút gửi tạm khóa khi đang chờ response để tránh bấm lặp.
- Có nút “Tải lại dữ liệu” để thấy thay đổi từ người khác; có trạng thái đang tải, danh sách rỗng, lỗi và thử lại. Gửi thất bại giữ input để sửa; chỉ thông báo thành công sau khi nhận response phù hợp.
- GET ban đầu khi mở trang; sau tạo/sửa/xóa, GET lại từ server. Không yêu cầu optimistic update ở bài nhập môn.
- Tìm kiếm theo tên là bài thêm sau CRUD, thực hiện qua query API.

### 3.5. Chuẩn bị để làm được trong 60 phút

Trước giờ học, người hướng dẫn cung cấp project đã cài dependencies, lệnh chạy đã kiểm tra, giao diện tĩnh đơn giản, server khởi động được, config mã hóa đã chuẩn bị, hợp đồng API và tên hàm/hàm trống. Chỉ có kiểm tra kết nối chỉ đọc; không có lời giải routes CRUD/validation hoặc hàm fetch hoàn chỉnh. Học viên và Agent điền các phần đó trong giờ.

Mọi máy đã chạy được khung, truy cập Supabase được và clone repo trước khi bắt đầu tính giờ. Nếu dành giờ thực hành để cài môi trường hay học framework mới thì không còn đủ thời gian cho CRUD và Git.

Agent có thể hỗ trợ viết code, đọc lỗi, đề xuất request kiểm tra và review. Học viên vẫn phải thực hiện request, đọc diff, thử giao diện và giải thích một thay đổi trực tiếp. Không yêu cầu viết test suite hoặc làm giao diện cầu kỳ trong giờ.

## 4. Hợp đồng products dự kiến dùng chung

### 4.1. Schema thật do người tổ chức cung cấp

Giữ nguyên hai bảng PostgreSQL, không chạy lại SQL seed trên dữ liệu hiện có. Phạm vi một bảng nghĩa là CRUD products, không phải xóa categories khỏi database.

| Cột products | Kiểu/ràng buộc hiện có | Quy ước bài học |
| --- | --- | --- |
| id | bigint identity, primary key | Database cấp; request dùng số nguyên dương an toàn trong JavaScript |
| category_id | bigint NOT NULL, FK categories(id), ON DELETE RESTRICT | Backend tự gán LAB_CATEGORY_ID khi POST; không cho sửa từ form |
| name | text NOT NULL, CHECK trim dài 1–150 | Backend trim, kiểm tra và lưu tên đã chuẩn hóa |
| price | integer NOT NULL, CHECK >= 0 | Số nguyên từ 0 đến 2.147.483.647, VND |
| stock | integer NOT NULL, CHECK >= 0 | Số nguyên từ 0 đến 2.147.483.647 |

categories có id bigint identity, name text NOT NULL UNIQUE, CHECK trim dài 1–100. Seed được cung cấp có 3 danh mục và 6 sản phẩm. Cả hai bảng đã bật RLS; chưa có policy nào được cung cấp. Người hướng dẫn kiểm tra id danh mục thật trước khi đặt LAB_CATEGORY_ID; không mặc định seed luôn có id 1 sau nhiều lần chạy.

Cho phép trùng tên sản phẩm. API ánh xạ category_id thành categoryId chỉ đọc. ID bigint có thể vượt giới hạn số nguyên an toàn của JavaScript: bài lab dùng các id nhỏ hiện tại, không nhận id vượt Number.MAX_SAFE_INTEGER; nếu sau này dùng id lớn cần đổi hợp đồng sang chuỗi.

Ví dụ response: `{"id":1,"categoryId":1,"name":"Trà đào","price":25000,"stock":20}`. UI có thể hiện categoryId chỉ đọc; không cần dropdown danh mục.

### 4.2. Endpoint và response

Base URL backend cho Thương: `http://localhost:3000/codeapi/thuong/api`; cho Hùng: `http://localhost:3000/codeapi/hung/api`. Các endpoint bên dưới tính tương đối với base URL của từng người, khác URL Supabase `/rest/v1/`. Mọi backend dùng chung publishable key và cùng dữ liệu.

| Request | Dữ liệu gửi | Kết quả thành công |
| --- | --- | --- |
| GET /products | Không có body | 200, mảng sản phẩm theo id tăng dần |
| GET /products/:id — bài mở rộng | id trong path | 200, một đối tượng |
| POST /products | name, price, stock đầy đủ | 201, đối tượng đã lưu với id từ DB |
| PATCH /products/:id | Ít nhất một trong name, price, stock | 200, đối tượng sau sửa |
| DELETE /products/:id | id trong path; không có body | 204, không có response body |
| PUT /products/:id — bài thêm | name, price, stock đầy đủ | 200, đối tượng sau thay thế; không tạo mới nếu id chưa có |
| GET /products?q=tra — bài mở rộng | q trong query | 200, mảng khớp tên không phân biệt hoa/thường |

Với bài tìm kiếm: q trim, tối đa 100 ký tự, rỗng tương đương không lọc; quy ước tìm chuỗi con, không yêu cầu bỏ dấu tiếng Việt; ký tự đặc biệt phải được xử lý để giữ đúng quy ước và tránh ghép truy vấn tùy tiện.

Quy tắc chung: JSON với Content-Type application/json cho body; id path đúng định dạng nguyên dương; chỉ nhận các trường được phép ghi; từ chối id/categoryId/category_id và trường lạ trong body; không tự ép chuỗi `"25000"` thành số. PATCH không nhận object rỗng. Không cho phép sửa/xóa không có điều kiện id.

| Tình huống | Hợp đồng bài tập |
| --- | --- |
| Danh sách không có dữ liệu/kết quả lọc | 200 và [] |
| ID sai định dạng, JSON hỏng, dữ liệu thiếu/sai | 400 |
| ID hợp lệ nhưng không tồn tại khi xem/sửa/xóa | 404 |
| Lỗi database/kết nối từ backend đến Supabase | 500 với thông báo chung; log chi tiết ở server, không log key |
| Browser không nhận được response do lỗi mạng | Không có HTTP status; frontend báo lỗi kết nối |

Mẫu lỗi: `{"error":{"code":"VALIDATION_ERROR","message":"Thông tin không hợp lệ","fields":{"price":"Giá phải là số nguyên không âm"}}}`. Các lỗi khác có code tương ứng như NOT_FOUND/INTERNAL_ERROR; fields là tùy chọn.

Không chuyển nguyên trạng mọi status của Supabase ra frontend. Học viên phải đáp ứng hợp đồng bài tập. Khi dùng SDK, insert/update cần yêu cầu trả về dữ liệu đã lưu nếu muốn xây response; update/delete phải lọc đúng id và phân biệt “không có hàng bị tác động” với thành công. [Insert](https://supabase.com/docs/reference/javascript/insert), [Update](https://supabase.com/docs/reference/javascript/update), [Delete](https://supabase.com/docs/reference/javascript/delete).

## 5. Supabase và cấu hình public dùng chung

### 5.1. Cấu hình Supabase dùng chung

Đã chốt dùng cấu hình public đã mã hóa: `config/public-config.enc.json` và `.lab/config.key`. Backend gọi `loadPublicConfig()` từ `config/load-config.mjs`; thành viên không phải tạo env hoặc plaintext config. Bản phân phối phải giữ cả file mã hóa và folder ẩn như cập nhật ở đầu tài liệu.

| Biến | Đặt ở đâu | Giá trị/nguồn lấy | Mức cần thiết |
| --- | --- | --- | --- |
| SUPABASE_URL | Config mã hóa, đọc bởi loader backend | Project URL trong project Supabase | Đã cấu hình bởi người tổ chức |
| SUPABASE_PUBLISHABLE_KEY | Config mã hóa, chỉ backend đọc | Publishable key; không dùng secret/service_role | Đã cấu hình bởi người tổ chức |
| LAB_CATEGORY_ID | Config mã hóa, chỉ backend đọc | ID danh mục đã xác minh | Đã cấu hình bởi người tổ chức |
| PORT | Backend | Mặc định chung trong server, ví dụ 3000 | Thành viên không cần chỉnh |
| HOST | Backend | Mặc định 127.0.0.1 cho lab local | Thành viên không cần chỉnh |
| Địa chỉ API cá nhân | Frontend | Đường dẫn tương đối `./api/products` | Viết cố định trong scaffold, không cần env |

Node đọc cấu hình ở server bằng `loadPublicConfig()`; không phát `.env` hoặc plaintext cho thành viên. File mã hóa chứa `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `LAB_CATEGORY_ID`; không chứa secret/service_role/database password. Mã hóa ở đây chỉ che nội dung khỏi việc mở file trực tiếp, không biến publishable key thành secret. Frontend HTML/JS gọi `./api/products` tới backend riêng của bài, không đọc config Supabase.

Publishable key nhận diện ứng dụng, không tự cấp quyền. Request không đăng nhập chạy với role `anon`; quyền thực tế là phần giao nhau giữa GRANT và RLS policy. [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase roles](https://supabase.com/docs/guides/database/postgres/roles), [RLS: grants và policies](https://supabase.com/docs/guides/database/postgres/row-level-security).

Đây là lab cố ý cho phép truy cập công khai không cần đăng nhập: bất kỳ ai có project URL và publishable key đều có thể gọi Data API trực tiếp, không chỉ qua giao diện/backend bài. RLS giới hạn quyền vào CRUD `products` và SELECT `categories`; không thể phân biệt thành viên CLB. Chỉ dùng project này cho dữ liệu lab, không đặt dữ liệu riêng tư/production vào hai bảng đó. Không dùng secret key, service_role hoặc mật khẩu DB.

### 5.2. Grants và RLS — thao tác Supabase của người tổ chức

SQL đã chuẩn bị để review nằm tại [`01-ca-nhan/database/supabase-lab-preflight.sql`](../01-ca-nhan/database/supabase-lab-preflight.sql) và [`01-ca-nhan/database/supabase-lab-access.sql`](../01-ca-nhan/database/supabase-lab-access.sql). Không chạy lại chúng trong lượt triển khai web; không tạo bảng, xóa dữ liệu, chạy seed, đổi schema hay tắt RLS.

Thiết kế quyền:

- Role `anon` có `USAGE` trên schema `public` để dùng Data API.
- `products`: SELECT và DELETE trên bảng; INSERT chỉ trên `category_id,name,price,stock`; UPDATE chỉ trên `name,price,stock`. `id` tiếp tục do identity sinh; không cấp TRUNCATE, REFERENCES, TRIGGER hay quyền sửa ID/danh mục.
- `categories`: SELECT only.
- RLS policies chỉ áp dụng cho `anon`; thao tác được phép dùng `USING (true)`/`WITH CHECK (true)` vì tất cả người học được truy cập chung toàn bộ hàng. Grants và policies cùng giới hạn ở hai bảng.
- Trước khi áp dụng: chạy preflight để xem dữ liệu, Data API expose `public`, trạng thái RLS và policy/grant hiện tại. SQL dừng nếu có policy trên hai bảng hoặc anon/PUBLIC đang có table grants trên bảng public khác; không tự drop/ghi đè policy và không thay grants ở bảng khác.

Đây là quyền public không đăng nhập và cho phép xóa mọi product. Publishable key có thể bị dùng trực tiếp bên ngoài trang bài; giới hạn RLS không giới hạn số request hay xác minh thành viên. Người tổ chức cần xác nhận hai bảng là dữ liệu lab phù hợp trước khi chạy SQL. Nếu project có dữ liệu cần giữ kín, không chạy bộ quyền này trên đó.

### 5.3. Người tổ chức chuẩn bị trước buổi học

1. Dùng `npm run check:supabase` để kiểm tra kết nối bằng `SELECT id FROM products LIMIT 1`. Lệnh không sửa data/schema/quyền và không in cấu hình.
2. Xác nhận config mã hóa và `.lab/config.key` được giữ nguyên trong repo; backend gọi `loadPublicConfig()` từ `config/load-config.mjs`. Không tạo plaintext/env mới.
3. Không chạy lại SQL grants/RLS, không seed/reset và không thử insert/update/delete trong lúc chỉ xác minh kết nối.
4. Nếu truy vấn chỉ đọc thất bại, xem `config/README.md` và Dashboard hiện trạng; không tự sửa quyền/schema để làm lệnh qua.

Không gửi key secret trong chat. Key publishable vẫn là thông tin public; việc mã hóa file chỉ che nội dung khi mở file, quyền dữ liệu do grants/RLS quyết định.

### 5.4. Dữ liệu chung và quan sát thay đổi của nhau — đã xác nhận

Tất cả thành viên dùng cùng project Supabase và cùng bảng public.products. Không thêm owner_id, không gắn nhãn tên theo thành viên và không lọc dữ liệu theo slug. Thư mục/backend riêng chỉ tách phần code của mỗi người; dữ liệu thật hoàn toàn dùng chung.

- GET: mọi backend đọc cùng danh sách sản phẩm, kể cả dữ liệu seed và sản phẩm người khác tạo.
- POST: người này tạo sản phẩm, người khác gọi GET lại sẽ thấy sản phẩm mới.
- PATCH/PUT: được sửa bất kỳ sản phẩm đang có theo id; category_id giữ nguyên. Những người khác GET lại sẽ thấy giá trị mới.
- DELETE: được xóa bất kỳ sản phẩm đang có theo id; những người khác GET lại sẽ không còn thấy bản ghi đó, GET chi tiết trả 404.
- Nếu A đang mở form nhưng B đã xóa bản ghi, A gửi sửa sẽ nhận 404; giao diện báo sản phẩm không còn tồn tại và tải lại danh sách.
- Nếu hai người sửa cùng bản ghi, bài cơ bản chấp nhận lần ghi thành công sau cùng quyết định giá trị của trường bị sửa. Không yêu cầu cơ chế khóa hay versioning trong bài một giờ.

Cách đồng bộ giao diện ở mức cơ bản: tải GET khi mở trang, sau mỗi thao tác ghi thành công và khi bấm nút “Tải lại dữ liệu”. Thay đổi từ người khác hiện ra ở lần GET tiếp theo, không tự xuất hiện trên màn hình đang đứng yên. Không dùng mảng/localStorage làm nguồn dữ liệu độc lập. Chưa yêu cầu Supabase Realtime hoặc polling; nếu muốn tự cập nhật không cần bấm thì bổ sung yêu cầu đó sau.

Kịch bản demo bắt buộc: mở hai bài `/codeapi/thuong/` và `/codeapi/hung/`; Thương tạo sản phẩm → Hùng tải lại thấy; Hùng sửa → Thương tải lại thấy; Thương xóa → Hùng tải lại không còn sản phẩm. Mỗi người vẫn gọi module backend của mình, cùng đọc/ghi một database.

Đây là dữ liệu thực hành chung nên sửa/xóa sẽ tác động thật tới cả lớp, không có bản sao theo nhánh Git. Chỉ thử trên bảng đã thống nhất; không reset toàn bộ database hoặc xóa hàng loạt. Không yêu cầu giữ nguyên các hàng seed products, vì chúng cũng thuộc dữ liệu chung có thể CRUD; bảng categories vẫn ngoài phạm vi sửa/xóa của bài.

## 6. Lộ trình thực hành API và Git

### 6.1. Kịch bản trực tiếp khoảng 60 phút

Giả định môi trường và kết nối đã sẵn sàng trước giờ. Phần 1 là demo nhanh dẫn vào thực hành, phòng thử vẫn mở để tự khám phá sau đó. Kiến thức API/Git trong hai tài liệu được gửi đọc trước, không giảng lại toàn bộ trong 60 phút.

| Phút | Hoạt động | Kết quả tối thiểu |
| --- | --- | --- |
| 0–8 | Demo phòng thử GET/POST/PATCH/DELETE, đối chiếu PUT | Hiểu request/response và database trước/sau |
| 8–12 | Đọc đề, kiểm tra config đã chuẩn bị, tạo branch cá nhân | Khung chạy được, biết chỗ cần tự viết |
| 12–25 | Mỗi người viết GET danh sách/POST backend và frontend tương ứng, có Agent hỗ trợ | Hiển thị và tạo được sản phẩm thật |
| 25–42 | Mỗi người viết PATCH/DELETE backend và frontend | CRUD hoàn chỉnh trên một trang |
| 42–50 | Thử request sai, reload, sửa/xóa đúng id; đọc diff và commit | Dữ liệu thật, backend validation, không lộ key/config bí mật |
| 50–57 | Push, mở PR; bạn cùng cặp review và góp ý | Mỗi người có PR và review cho người khác |
| 57–60 | Demo nhanh, giải thích một request và một đoạn code | Xác nhận hiểu bài, ghi nhận phần chưa xong |

Đây là thời lượng mục tiêu với scaffold và Agent, cần người hướng dẫn chạy thử toàn bài trước buổi học. Nếu chậm tiến độ, ưu tiên GET/POST end-to-end và Git, ghi PATCH/DELETE là phần chưa hoàn thành để làm tiếp; không coi CRUD đã đạt khi chỉ có GET/POST. GET chi tiết, PUT, tìm kiếm, conflict và merge tích hợp không bắt buộc trong 60 phút.

### 6.2. Git trong bài cá nhân và làm theo cặp

Cả CLB dùng một repository. Mỗi người có branch riêng và chỉ sửa `codeapi/<slug>/`; PR cùng về main. Bài được tách theo thư mục nên có thể cùng tồn tại sau merge. Bạn cùng cặp review PR; người hướng dẫn quản lý file dùng chung và tích hợp.

1. Clone trước giờ; trong giờ cập nhật main rồi tạo branch `feature/thuong-products` (thay thuong bằng slug của mình).
2. Đọc status/diff; stage và commit mốc GET/POST, sau đó PATCH/DELETE. Commit ngắn nhưng rõ chức năng.
3. Push và mở PR vào main; ghi cách chạy và request đã thử. Không push trực tiếp main.
4. Người cùng cặp xem code và chạy/thử ít nhất một luồng; tác giả xử lý góp ý. Không coi lời nhận xét của Agent thay cho review của bạn học.
5. Cập nhật thay đổi từ main trước khi merge; merge sau review nếu còn thời gian. Máy người hướng dẫn pull main, khởi động lại nếu cần và tải trang chủ để mở bài vừa nhận. Nếu chưa merge, PR mở và review là bằng chứng nộp bài, tiếp tục merge sau giờ.

Giải thích working directory → staging → commit → remote trên chính những thay đổi của học viên. Git chỉ quản lý code, không tách/đồng bộ/rollback dữ liệu Supabase. Conflict có chủ đích là bài mở rộng sau giờ, không ép vào khung 60 phút.

### 6.3. Quy ước Agent dự kiến đưa vào AGENTS.md

Chỉ lên nội dung quy ước ở đây, chưa tạo file trong bước lập kế hoạch. Dùng tên `AGENTS.md` theo quy ước công cụ; nếu công cụ khác dùng `AGENT.md` thì liên kết/chuyển hướng phù hợp khi triển khai.

- Chỉ sửa codeapi/<slug>/ được giao; không sửa/xóa bài người khác. Không tự thay server chung, index tổng, package.json hay cấu hình gốc; nếu cần dependency mới thì trao đổi với người hướng dẫn.
- Nêu mục tiêu học tập, schema thật, hợp đồng endpoint và phạm vi một trang CRUD products. Không tự thêm categories CRUD, auth, upload hay framework mới.
- Agent hỗ trợ cả backend và frontend, làm theo mốc GET/POST rồi PATCH/DELETE; giải thích ngắn luồng request và phần thay đổi để người học kiểm tra.
- Mọi bài đọc/ghi chung public.products; không tự thêm owner_id, prefix tên hoặc lọc theo thành viên. Được sửa/xóa sản phẩm do người khác tạo theo id; không sửa code của họ và không reset/xóa hàng loạt database.
- Dữ liệu sản phẩm phải đi qua backend; không thay bằng mock/localStorage và không gọi Supabase trực tiếp từ browser.
- Public config chứa publishable key và được commit theo hướng dẫn; không thêm secret/service_role/mật khẩu DB hoặc log credentials.
- Không tự chạy reset/seed lại, sửa schema hay xóa dữ liệu ngoài bản ghi thử của bài. Không tự push/merge nếu học viên chưa yêu cầu; để học viên thực hành các bước Git.
- Nếu học viên dùng nhiều Agent, chia rõ phần sở hữu backend/frontend, chốt hợp đồng trước, một đầu mối kiểm tra tích hợp; không cho hai Agent sửa cùng file đồng thời. Không bắt buộc dùng nhiều Agent.
- Trước bàn giao: chạy luồng GET → POST → PATCH → DELETE, thử input sai và persistence; báo rõ phần đã thử/chưa thử. Không phát sinh test suite, refactor hay thiết kế phức tạp ngoài bài.
- Agent không tự đánh dấu học viên đã hiểu; người hướng dẫn kiểm tra bằng một yêu cầu sửa nhỏ, chẳng hạn đổi thông báo giá sai và giải thích backend vẫn chặn request trực tiếp.

## 7. Kiểm tra, bài nộp và đánh giá

### 7.1. Ma trận nghiệm thu phần 2

| Thử nghiệm | Bằng chứng cần thấy |
| --- | --- |
| Trang chủ và hai bài cá nhân | Thêm thư mục đúng quy ước thì được liệt kê; bài Thương/Hùng gọi đúng router của mình, cùng tồn tại sau merge |
| Quan sát dữ liệu chung giữa hai bài | Thương tạo → Hùng GET thấy; Hùng sửa → Thương GET thấy; Thương xóa → Hùng GET không còn; dùng hai module backend riêng |
| Bản ghi bị người khác xóa khi đang sửa | PATCH trả 404, UI giải thích và tải lại; không báo thành công giả |
| GET danh sách | Response đúng cấu trúc; giao diện hiển thị từ API |
| POST hợp lệ | 201, id do DB cấp; GET lại có hàng vừa tạo |
| Reload/restart backend | Dữ liệu đã tạo vẫn còn |
| PATCH chỉ price | name và stock giữ nguyên; reload thấy giá mới |
| DELETE | 204 không body; GET danh sách sau đó không còn hàng; hàng khác giữ nguyên |
| Tên rỗng, giá âm, stock dạng chuỗi, field lạ, body rỗng | 400 khi gửi trực tiếp bằng Postman, không phụ thuộc validation frontend; DB không đổi |
| id sai định dạng/id hợp lệ nhưng không có | Lần lượt 400/404; update/delete không âm thầm báo thành công |
| Bảng hoặc kết quả tìm kiếm rỗng | 200 và []; frontend có trạng thái rỗng |
| Backend tắt/browser mất kết nối | Thông báo kết nối, có thử lại; không hiện thành công giả |
| Backend không kết nối được Supabase | Request nhận lỗi server phù hợp, không lộ credentials |
| Kiểm tra phân lớp | Network chỉ gọi API backend; không CRUD bằng localStorage/mảng; backend kiểm tra dữ liệu |
| GET chi tiết/PUT/tìm kiếm — bài mở rộng | Hoạt động đúng theo hợp đồng khi được chọn làm thêm |

Kiểm tra bắt buộc ưu tiên bằng request thực và quan sát dữ liệu; chưa yêu cầu cả CLB học framework test tự động mới chỉ để qua bài. Không cần viết script reset phá dữ liệu để nghiệm thu.

### 7.2. Bài nộp

- Thư mục codeapi/<slug>/ và README cá nhân trong repo chung: cách thử bài, endpoint đúng route bài, kết quả kiểm tra; README chung hướng dẫn chạy server; public config đã do người tổ chức chuẩn bị.
- Collection Postman hoặc danh sách request có body, status mong đợi/thực tế; không kèm secret.
- Liên kết PR cá nhân và review cho bạn cùng cặp; conflict chỉ là bài mở rộng sau giờ.
- Demo luồng tạo → đọc → sửa → xóa; minh chứng persistence bằng reload/restart và một trường hợp backend từ chối dữ liệu sai.
- Mỗi người giải thích được một endpoint, một hàm gọi API và một thay đổi trong commit của mình. Nếu cho phép AI, vẫn cần tự sửa được một yêu cầu nhỏ khi demo.

### 7.3. Thang đánh giá đề xuất

| Hạng mục | Điểm |
| --- | --- |
| Giải thích và hoàn thành thử thách mô phỏng | 15 |
| API, database thật và hợp đồng CRUD | 35 |
| Frontend gọi API, trạng thái tải/rỗng/lỗi, phân chia trách nhiệm | 20 |
| Branch, commit, PR, review và phối hợp | 20 |
| Hướng dẫn chạy, request kiểm tra, giải thích cá nhân | 10 |

Bài CRUD dùng dữ liệu giả hoặc chỉ thay đổi state phía frontend chưa đạt phần 2 dù giao diện hoàn chỉnh. Chưa đánh giá PUT/tìm kiếm như điều kiện bắt buộc của lượt cơ bản.

## 8. Quyết định đã chốt và chi tiết đề xuất

Đã chốt theo phản hồi:

- Mỗi người tự làm backend Node.js và frontend gọi backend, có Agent hỗ trợ, thời lượng khoảng một giờ.
- Giữ schema Supabase được cung cấp; dùng chung project hiện tại và toàn bộ dữ liệu products, không chia theo thành viên; backend gán danh mục cố định khi tạo sản phẩm.
- Có trang chủ tổng tự đọc các thư mục thành viên như codeapi/thuong/, codeapi/hung/ và dẫn tới bài tương ứng.
- Cả bộ bài nằm trong repo chung; bài của mỗi người có frontend và backend riêng trong thư mục của họ.

Chi tiết tổ chức được đề xuất cho yêu cầu mới:

| Nội dung | Đề xuất | Mục đích |
| --- | --- | --- |
| Khung chạy | Một Node.js/Express server trên mỗi máy, gắn router theo thư mục | Không phải mở một port cho mỗi bài |
| Trang chủ | Quét thư mục con đúng quy ước trong codeapi; liên kết tới /codeapi/<slug>/ | Người học không cần cùng sửa index tổng |
| Dữ liệu chung — đã chốt | Tất cả cùng CRUD public.products, không phân chia theo thành viên | Mọi người thấy thay đổi của nhau khi GET lại |
| Cập nhật màn hình | GET khi mở trang/sau mutation và nút tải lại; chưa Realtime | Giữ bài một giờ đơn giản, phân biệt DB chung với UI tự cập nhật |
| Frontend | HTML/CSS/JS thuần, UI tĩnh có sẵn, tự viết fetch và gắn sự kiện | Đủ gọn cho giờ học |
| Git | Một người một thư mục, một branch, một PR vào main chung | Luyện cộng tác và tập hợp bài lên trang chủ |
| Nội dung một giờ | 8 phút mô phỏng, còn lại CRUD + kiểm tra + PR | Lý thuyết đọc trước, phần khám phá thêm làm sau |

Đã xác nhận dữ liệu hoàn toàn dùng chung, bao gồm thấy kết quả thêm/sửa/xóa của nhau. Khung server chung và cách làm mới bằng GET đã được triển khai; danh sách thành viên/slug được đọc từ folder, không cần chờ đủ tên. Quyền Supabase không được thay đổi lúc triển khai web.

## 9. Nguồn đối chiếu

- README.md; 01-ca-nhan/BAI-TAP.md và database/setup.sql; 02-lam-nhom/BAI-TAP.md và database/setup.sql trong project.
- Tài liệu API người dùng cung cấp, mở đầu “Hãy tưởng tượng bạn đang làm một ứng dụng đặt đồ ăn…”.
- Tài liệu Git người dùng cung cấp, mở đầu “Phần 1. Git là gì? Tại sao cần Git?…”.
- Tài liệu Supabase chính thức được liên kết ở mục 3–5: [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [roles](https://supabase.com/docs/guides/database/postgres/roles), [RLS và grants](https://supabase.com/docs/guides/database/postgres/row-level-security). Các lựa chọn stack, lịch học, phân công và chấm điểm là đề xuất cho CLB, không phải yêu cầu của Supabase.
