# Kế hoạch triển khai web VIC API & Git Lab

> **Cập nhật mới nhất — cấu hình đã được che theo yêu cầu người tổ chức:**
> Bản phân phối dùng `config/public-config.enc.json`, khóa đi kèm ở `.lab/config.key`.
> Backend gọi `loadPublicConfig()` từ `config/load-config.mjs`; xem `config/README.md`.
> Mọi chỗ còn nhắc `config/public-config.json` bên dưới là quyết định cũ đã thay thế;
> không tạo lại plaintext hoặc yêu cầu thành viên điền env.
> Khi clone/deploy phải bao gồm cả file mã hóa và thư mục ẩn chứa khóa, giữ nguyên
> vị trí. Không yêu cầu thành viên nhập env. Khóa trong repo chỉ giúp che nội dung,
> không thay thế grants/RLS. Quy tắc mới này thay hướng dẫn lưu JSON đọc trực tiếp.

Ngày: 19/11/2026. Trạng thái: web hạ tầng, mô phỏng, hướng dẫn và scaffold đã triển khai; CRUD thật vẫn là TODO học viên.

Nguồn yêu cầu: `docs/PLAN.md` là kế hoạch bài tập; `STYLE_GUIDE.md` là nhận diện giao diện. Tài liệu này chuyển hai nguồn đó thành đầu việc triển khai. `docs/LUNA_PROMPT.md` ghi ranh giới triển khai đã được người tổ chức chấp thuận.

## 1. Sản phẩm cần bàn giao

Một web học tập chạy local bằng Node.js, có ba khu vực:

1. Trang chủ tổng: giới thiệu ngắn, vào phòng mô phỏng, đọc đề thực hành, liệt kê bài thành viên từ thư mục.
2. Phòng mô phỏng: thử GET/POST/PUT/PATCH/DELETE, đọc request/response và quan sát database giả trước/sau.
3. Khu thực hành: hướng dẫn khoảng 60 phút và bộ khung cá nhân để mỗi học viên tự viết GET danh sách, POST, PATCH, DELETE ở backend và frontend gọi backend; GET chi tiết, PUT, tìm kiếm là mở rộng.

Dữ liệu phần 2 dùng chung `public.products` trên Supabase hiện tại. Mỗi bài có code/API riêng nhưng đọc/ghi cùng bảng: một người xóa, người khác GET lại sẽ thấy bản ghi biến mất. Không tạo bảng/project riêng, owner_id, nhãn tên hoặc bộ lọc theo thành viên. Chưa Realtime/polling; làm mới bằng nút tải lại và GET sau thao tác.

Bản triển khai bộ bài tập không chứa lời giải CRUD phần 2. Luna làm hoàn chỉnh hạ tầng và mô phỏng; học viên cùng Agent của họ hoàn thành CRUD trong giờ thực hành.

## 2. Ý tưởng giao diện theo STYLE_GUIDE.md

### Nhận diện chung

| Thành phần | Cách áp dụng vào web bài tập |
| --- | --- |
| Nền | `#FAFAF8`; vùng phụ `#F1F3F6`; panel trắng |
| Chữ | `#161616`; mô tả `#5B606B` |
| Nhấn | `#2457F5`; nền chọn `#EAF0FF` |
| Font | Be Vietnam Pro cho nội dung; IBM Plex Mono cho JSON, URL, method và status; có font fallback |
| Container | Tối đa 77.5rem; khoảng lề bám guide, màn hình nhỏ giảm tương ứng |
| Khoảng cách | Nhịp 12/16/20/24/32/48/64px; vùng công cụ dùng mật độ gọn hơn hero |
| Card | Cạnh vuông, viền mảnh; không biến tất cả panel thành card bo lớn |
| Nút | Viên thuốc; nút chính đen/chữ trắng, hover xanh; nút phụ viền mảnh |
| Header | Gọn, dạng viên thuốc, kính nhẹ có fallback nền đặc; không che nội dung |
| Footer | Dải nền đen nhỏ, tên bài và link điều hướng nội bộ |
| Chuyển động | CSS hover/focus và highlight thay đổi ngắn; tôn trọng reduced motion |

Guide được viết từ một website React khác. Repo hiện tại chưa có các component `VicLogo`, `Button`, Motion hoặc assets được guide dẫn tới. Không import đường dẫn không tồn tại, không thêm React/Tailwind/Motion chỉ để sao chép guide. Chuyển token sang CSS variables; dùng HTML semantic và CSS thuần. Nếu chưa có logo thật, dùng chữ VIC, không tự bịa logo/tên thành viên/kênh liên hệ.

Giữ phong cách công nghệ và biên tập, nhưng trang công cụ ưu tiên thao tác. Không sao chép hero cao 55rem, Canvas, quỹ đạo liên tục hoặc toàn bộ section marketing của /home-preview. Trang chủ chỉ cần tiêu đề đậm cỡ vừa, khoảng trống rõ, một nét/lưới hình học tĩnh rất nhẹ nếu hữu ích. Không thêm ảnh minh họa hoặc thư viện hiệu ứng.

Kết quả tra cứu UI/UX bổ trợ gợi ý phân cấp và lưới rõ, nhưng palette/font học thuật không phù hợp VIC nên không sử dụng; STYLE_GUIDE.md giữ quyền quyết định nhận diện.

### Trang chủ `/`

- Header: VIC API & Git Lab; link Mô phỏng, Thực hành, Bài thành viên.
- Giới thiệu: “Hiểu API. Tự tay thực hành.”, mô tả một câu; hai hành động Vào mô phỏng và Xem bài thực hành.
- Hai khối giới thiệu phần 1/phần 2, nhãn phân biệt dữ liệu giả và dữ liệu thật.
- Danh sách thành viên: các hàng hoặc card gọn gồm slug, đường dẫn bài và nút Mở bài. Không có điểm số, avatar giả hay trạng thái “hoàn thành” suy ra từ việc có folder.
- Có trạng thái tải danh sách, chưa có bài, đọc danh sách lỗi và nút tải lại.
- Không có ô nhập secret, cấu hình Supabase hoặc nút reset dữ liệu thật trên trang chủ.

### Phòng mô phỏng `/simulation/`

- Đầu trang: tiêu đề, nhãn MÔ PHỎNG, ghi chú không gọi Supabase; link về trang chủ.
- Desktop: hai cột gần 1:1. Trái soạn request rồi response; phải database giả và vùng trước/sau. Tablet/mobile xếp dọc.
- Request: method select, chọn danh sách/chi tiết, nhập ID bất kỳ (kể cả ID sai để thử lỗi), query theo ngữ cảnh, header Content-Type chỉ đọc, textarea JSON có label; nút Gửi và Nạp mẫu. Response dùng `categoryId`, DB giả có thể giữ `category_id` nội bộ; price/stock là số nguyên 0–2.147.483.647.
- Response: status bằng chữ và số, JSON trong vùng code cuộn nội bộ; 204 hiện “Không có response body”; mất mạng giả hiện “Không nhận được phản hồi HTTP”.
- Database giả: bảng sản phẩm, dấu hiệu đọc/thêm/sửa/xóa có cả chữ; trước/sau giữ được hàng vừa xóa. GET không thay bảng.
- Bên dưới: lịch sử request giới hạn số lượng trong phiên; thử thách ngắn và phần xem giải thích. Nút khôi phục chỉ tác động mô phỏng.
- Lỗi JSON, lỗi dữ liệu, lỗi server giả và mất mạng giả có thông báo riêng. Không gửi network request đến URL người học nhập.

### Trang đề `/practice/` và bài `/codeapi/<slug>/`

Yêu cầu chính phần 2 là GET danh sách, POST, PATCH, DELETE; GET chi tiết, PUT và tìm kiếm là mở rộng. Giá/stock phải là số nguyên 0–2.147.483.647; response dùng `categoryId`, database có thể giữ `category_id`.

- Trang đề có mục tiêu, checklist 60 phút, hợp đồng endpoint, schema, hướng dẫn Git và cách dùng Agent. Nội dung ngắn, có phần mở rộng để tránh một màn hình quá dài.
- Bài cá nhân có tên/slug, link về trang chủ và đề bài; nhãn “Dữ liệu thật — dùng chung cả CLB”.
- Toolbar: Thêm sản phẩm, Tải lại dữ liệu. Bảng id/tên/giá/tồn kho/hành động; form tên/giá/tồn kho ngay trong trang để giảm độ phức tạp modal.
- Xác nhận riêng trước xóa, giữ input khi lỗi; chuẩn bị vùng tải/rỗng/lỗi/thành công.
- Khi còn hàm TODO, hiện đúng “Chưa triển khai”, không dựng danh sách giả hoặc báo đã lưu.
- UI tĩnh có sẵn; học viên tự gắn sự kiện và viết hàm fetch, backend xử lý dữ liệu.

### Khả năng sử dụng cần giữ

Body từ 16px, label chính từ 14px; focus rõ; label thật cho input; nút chính tối thiểu 48px, hành động nhỏ tối thiểu 44px. Không chỉ dùng màu phân biệt method/status hoặc thay đổi dữ liệu. Lỗi ở gần trường và có vùng thông báo đọc được bằng công nghệ hỗ trợ. JSON dùng textarea thông thường, không thêm code editor nặng. Không để toàn trang tràn ngang; bảng/JSON được cuộn trong vùng riêng. Kiểm tra dấu tiếng Việt và zoom 200%.

## 3. Kiến trúc và cách tổ chức source dự kiến

Node.js >=22 + Express, ES modules, HTML/CSS/JS thuần; thư viện Supabase chỉ ở server. Supabase SDK đang khóa yêu cầu Node >=22. Khi clone dùng `npm ci`; không nâng dependencies nếu không cần. Một package.json và một tiến trình server trên mỗi máy; không có package.json/port riêng từng thành viên.

```text
index.html                         Trang chủ tổng
assets/
  css/tokens.css                   Token theo STYLE_GUIDE
  css/common.css                   Header, footer, nút, form, bảng
  js/home.js                       Lấy danh sách thành viên
simulation/
  index.html
  simulator.js                     Engine dữ liệu giả + HTTP giả
  ui.js                            Tương tác và render
  style.css
practice/
  index.html                       Đề ngắn, checklist, Git, Agent
  practice.js                       Chỉ tương tác đọc đề/checklist nếu cần
templates/member/                  Mẫu chưa có lời giải, không nằm trong gallery
  public/index.html
  public/app.js                    TODO fetch và gắn sự kiện
  public/style.css
  backend/routes.js                TODO xử lý CRUD
  README.md
codeapi/
  <slug>/                          Học viên sao chép mẫu vào đây
    public/...
    backend/routes.js
    README.md
server/
  index.js                         Khởi động, mount tĩnh/API
  member-registry.js               Quét folder và nạp module
  supabase.js                      Kết nối lazy, chỉ chạy phía server
scripts/
  create-member.js                 Tạo folder từ template, không ghi đè
config/public-config.enc.json    Cấu hình public đã mã hóa
.lab/config.key                  Khóa đi kèm, thư mục ẩn
config/load-config.mjs           Backend loader dùng chung
.gitignore
package.json
AGENTS.md                          Quy ước chung khi triển khai
README.md                          Hướng dẫn bộ bài mới
docs/
  PLAN.md                          Mục tiêu bài tập
  CODE_PLAN.md                     Tài liệu này
  LUNA_PROMPT.md                    Prompt bắt đầu triển khai sau khi duyệt
```

Tên file có thể tinh giản khi code nhưng phải giữ ranh giới phần chung, mô phỏng và bài cá nhân. Không tạo hàng loạt tầng service/controller/repository trống cho bài ngắn. Hai tên thuong/hung là ví dụ đường dẫn, không tự coi là danh sách thành viên đã xác nhận. Bài template không xuất hiện như bài học viên trong gallery.

### Quy ước đăng ký bài

- Quét các thư mục con trực tiếp của codeapi, slug chỉ gồm chữ thường không dấu/số/gạch ngang; chỉ nhận thư mục thật trong gốc được phép, bỏ qua symlink và file tạm.
- Có public/index.html thì được liệt kê; trả tối thiểu slug và URL chuẩn từ endpoint hạ tầng `GET /api/members`, không trả đường dẫn ổ đĩa.
- Server dùng registry để mount `/codeapi/<slug>/` và `/codeapi/<slug>/api`; chuẩn hóa URL trang về có dấu `/` cuối.
- Module backend xuất factory router với tên/tham số thống nhất, nhận context có hàm lấy Supabase client và LAB_CATEGORY_ID. Hạ tầng chỉ inject kết nối/cấu hình, không cung cấp hàm CRUD làm sẵn.
- Nạp module thiếu/lỗi theo từng bài; gallery và mô phỏng vẫn chạy. API bài bị lỗi trả thông báo có kiểm soát, không lộ stack/key; log phía server chỉ đủ chẩn đoán.
- Quét lúc khởi động; thêm folder hoặc sửa backend thì restart server để registry/router đồng bộ. `GET /api/members` và nút tải lại gallery trả registry đã mount lúc khởi động; sau khi thêm folder hoặc sửa backend phải restart server.
- Chỉ serve index tổng, assets, simulation, practice và public của thành viên. Không dùng static server trỏ toàn bộ repo.

### Kết nối và public config

Phương án đang dùng: backend đọc `config/public-config.enc.json` và `.lab/config.key` qua `loadPublicConfig()` trong `config/load-config.mjs`. Không tạo hoặc yêu cầu plaintext/env. Khi clone/đóng gói phải mang theo cả file mã hóa và folder ẩn. `PORT`/`HOST` có mặc định trong server. Publishable key không phải secret, nhưng RLS/grants giới hạn quyền role anon vào đúng public.products (CRUD) và public.categories (SELECT). Dùng chung toàn bộ products; mọi module đọc và sửa cùng dữ liệu.

Kết nối lazy: homepage/mô phỏng/đề bài vẫn mở nếu file mã hóa/khóa không đọc được. Bài thật báo cấu hình chưa sẵn sàng, không fallback mock. Không log key. Frontend dùng `./api/products`; backend Node gọi `loadPublicConfig()` và dùng publishable key, không có secret/service_role/database password. Không cần CORS trong kiến trúc cùng origin.

Có hướng dẫn kiểm tra cấu hình và LAB_CATEGORY_ID; không seed/reset/schema migration tự động khi khởi động. SQL preflight/grants đã có trong `01-ca-nhan/database/`; không chạy lại trong lượt triển khai web. Script kết nối của app chỉ SELECT id LIMIT 1. Server/app không chạy SQL quyền tự động, không cấp quyền trên bảng khác, không tắt RLS.

### SQL grants/RLS cần chuẩn bị

SQL preflight và grants đã có trong `01-ca-nhan/database/`; lượt code web này không chạy lại. Script `npm run check:supabase` chỉ SELECT id LIMIT 1, không đổi dữ liệu/schema/quyền.

Vì key công khai và role anon không đăng nhập, bất kỳ ai có URL/key đều có thể gọi trực tiếp Data API với quyền trên. Chỉ dùng cho dữ liệu lab; người tổ chức xác nhận products/categories phù hợp trước khi chạy. SQL chuẩn bị không có nghĩa là đã áp dụng lên Supabase.

## 4. Ranh giới Luna làm sẵn và học viên tự làm

| Nội dung | Luna xây bộ bài tập | Học viên trong giờ |
| --- | --- | --- |
| Server chung, registry, trang chủ | Hoàn chỉnh | Chỉ sử dụng |
| Phòng mô phỏng và thử thách | Hoàn chỉnh, không chạm Supabase | Thao tác, giải thích |
| Đề bài, hợp đồng API, hướng dẫn Git/config/Agent | Hoàn chỉnh | Đọc và thực hiện |
| Supabase client và public config | Khung dùng chung đọc URL/key/category ID, không có secret | Sử dụng trong routes |
| UI sản phẩm | Bảng/form tĩnh và vùng trạng thái | Gắn sự kiện, hiển thị response |
| GET danh sách/POST/PATCH/DELETE thật | Handler đánh dấu TODO, trả 501 khi chưa làm | Tự viết validation, query, response |
| Hàm gọi API sản phẩm | Tên hàm, đầu vào/đầu ra và TODO rõ | Tự viết fetch, xử lý status/body/lỗi |
| GET chi tiết/PUT/tìm kiếm | Chỉ mô tả bài mở rộng | Không bắt buộc trong một giờ |

Template phía backend có thể khai báo routes và handler 501, nhưng không có truy vấn CRUD hoàn chỉnh. Các hàm frontend chưa làm phải báo TODO, không gọi ngầm một lời giải chung. Lỗi 501 của scaffold khác lỗi 500 khi bài đã triển khai gặp vấn đề server.

Phần simulator được phép dùng mảng và xử lý dữ liệu trong browser; phần thực hành thật phải qua backend. Không dùng chung engine mock để tạo fallback cho phần thực hành.

## 5. Quy trình làm và tiêu chí hoàn tất từng chặng

### Chặng 1 — Chốt nền tảng và hợp đồng module

Đọc PLAN, STYLE_GUIDE, kiểm tra repo/rule hiện có. Ghi Node.js >=22 theo yêu cầu SDK đang khóa trong lockfile; chỉ dùng `npm ci`, không nâng dependencies. Chốt export router, context, route base và mẫu TODO. Chuẩn bị package, .gitignore, backend loader cho config đã mã hóa và khung server. Không khởi tạo/push Git hoặc sửa database.

Đạt khi server chạy, route tĩnh đúng, Supabase client chỉ được khởi tạo khi cần; truy cập config/backend không trả nội dung source.

### Chặng 2 — Giao diện chung và trang chủ

Dựng token CSS theo guide, header/footer, button/input/table/message; dựng home và registry. Thêm lệnh tạo bài từ template, kiểm tra slug và không ghi đè folder có sẵn. Kiểm tra với folder tạm thay vì tạo thành viên giả vĩnh viễn.

Đạt khi folder hợp lệ được liệt kê, link đúng, empty/error state rõ; không phải sửa danh sách cứng trong index tổng.

### Chặng 3 — Phòng mô phỏng

Làm engine method/path/query/body/status trước, rồi gắn UI hai cột, response, bảng trước/sau, lịch sử, reset và thử thách. Giới hạn danh sách/history để UI ổn định trong phiên; reload/reset quay về dữ liệu giả ban đầu, có ghi chú.

Đạt khi đủ năm method, phân biệt PUT/PATCH và 204, lỗi không làm đổi DB giả, mất mạng không có status; không phát request Supabase hoặc request đến URL người học nhập.

### Chặng 4 — Trang đề và scaffold thực hành

Đưa nội dung 60 phút lên /practice, tạo template public/backend/README, inject Supabase context; ghi hợp đồng request/response và TODO ngay chỗ cần làm. Chuẩn bị AGENTS.md quy định file sở hữu, API contract, database chung, kiểm tra bắt buộc và giới hạn Agent.

Đạt khi tạo bài mới được, UI mở được, API TODO trả 501 rõ; không có lời giải CRUD bị vô tình đóng gói. Backend cá nhân có thể dùng cùng client mà không lộ key ra browser.

### Chặng 5 — Kiểm tra tích hợp và trải nghiệm

Kiểm tra home/gallery/router, mô phỏng, bảo vệ file server, responsive, bàn phím và trạng thái lỗi. Đối chiếu toàn bộ scope; sửa lỗi phát hiện được, không thêm feature mới chỉ để làm đẹp.

Hai bài fixture tạm có thể dùng stub để kiểm chứng route tách biệt và context đúng, nhưng không coi stub là kiểm chứng Supabase hay CRUD thật. Xóa fixture sau kiểm tra, không để lời giải trong template.

Với database thật, chỉ chạy read-only khi cấu hình đã có và được yêu cầu kiểm tra. Kịch bản hai người tạo → sửa → xóa cùng bản ghi là nghiệm thu bài học viên sau khi họ viết CRUD; chưa chạy được ở scaffold thì báo đúng giới hạn. Không lấp TODO bằng lời giải để tạo một báo cáo “CRUD đã pass”.

### Chặng 6 — Tài liệu và bàn giao

Cập nhật README theo Node/Supabase và cấu trúc mới; giữ hai thư mục bài MySQL cũ làm tài liệu cũ, không tự xóa hoặc chuyển đổi. Ghi cách tạo thư mục thành viên, restart server, public config, API routes, scope học viên và cách kiểm tra. Bàn giao danh sách file, lệnh chạy, kết quả kiểm tra/thứ chưa kiểm tra và phần học viên cần tự viết.

Không deploy, push, merge, tạo Supabase project hoặc chỉnh schema. Không tự chạy file grants/RLS lên Supabase; chỉ bàn giao để người tổ chức xem xét và chạy thủ công.

## 6. Kiểm tra cần thiết khi triển khai

| Nhóm | Kiểm tra chính |
| --- | --- |
| Khởi động | Một lệnh chạy; thiếu public config vẫn mở được phần không dùng DB |
| Registry | Rỗng, folder đúng/sai, slug không hợp lệ, symlink, thiếu/sai module; bài lỗi không kéo sập home |
| Route | Hai bài gọi đúng router; chuẩn hóa dấu /; public được serve, backend/config/source không được serve |
| Mô phỏng | GET list/detail, ID lỗi/không có/ID vừa tạo; POST cấp id; PATCH `/products/2`; DELETE `/products/6` và ID mới; giá trị ngoài giới hạn; status/error/body và DB giả không đổi khi lỗi |
| Tách dữ liệu | Simulator không gọi Supabase; thực hành không fallback sang mock; không filter theo thành viên |
| Scaffold | TODO rõ, 501 hợp lý, không có truy vấn CRUD hoặc hàm fetch lời giải |
| UI | 375/768/1024/1440px, zoom 200%, tiếng Việt, keyboard/focus, reduced motion, JSON dài |
| Supabase config | Public config đọc đúng; role anon có quyền dự kiến; không xuất hiện secret/service_role |
| Grants/RLS | Script chỉ tác động products/categories; RLS còn bật; không đụng dữ liệu; policy hiện hữu khiến script dừng |
| Học viên sau này | Hai bài cùng thấy thay đổi qua GET; 404 khi bản ghi đã bị người khác xóa; validation ở backend |

Có thể dùng test nhỏ cho engine mô phỏng và registry/path vì đây là logic trọng tâm; không thêm bộ test nặng cho CSS hay test chỉ lặp lại chi tiết implementation. Kiểm tra giao diện trong browser và lưu bằng chứng lỗi đã sửa nếu công cụ có sẵn. Phần chưa chạy được phải ghi rõ.

## 7. Các giới hạn giữ cho bài đơn giản

- Không thêm đăng nhập, phân quyền, danh mục CRUD, thanh toán, upload, Realtime, polling hoặc dashboard điểm số.
- Không tạo sẵn thư mục của thành viên chưa xác nhận; cung cấp template và lệnh tạo.
- Không dùng thư mục/slug để chia dữ liệu thật; slug chỉ chia code và URL.
- Không yêu cầu học viên sửa server/index tổng/package chung để nộp bài.
- Không đồng nhất “folder đã xuất hiện” với “bài đã hoàn thành”.
- Không coi runtime error của module là cách ly bảo mật: tất cả module chạy trong một tiến trình tin cậy local, không phải sandbox cho code lạ.
- Publishable key và quyền anon CRUD là public; không chạy lab trên project chứa dữ liệu riêng tư/production.
- Không tự đổi STYLE_GUIDE; dùng một biến thể công cụ gọn trong nhận diện sẵn có.

Danh sách đầu việc báo ra chat khi Luna bắt đầu: khung Node → token/UI chung → trang chủ/registry → simulator → trang đề/template → Supabase/config/AGENTS → kiểm tra → tài liệu bàn giao.
