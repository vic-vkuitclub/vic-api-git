# Quy ước làm việc cho Agent

## Ranh giới thư mục

- Mỗi học viên chỉ sửa `codeapi/<slug>/` của mình. Không sửa bài khác hoặc shared server để né TODO.
- `templates/member/` là scaffold tham khảo; thay đổi ở đây chỉ do người hướng dẫn quyết định.
- API và frontend thật phải do học viên hoàn thành. Đừng tự điền lời giải CRUD/fetch nếu yêu cầu là hướng dẫn hoặc giải thích.
- Trước khi sửa, đọc `/practice/` và README của bài; nói rõ file dự định thay đổi.

## Database dùng chung

- Tất cả bài dùng cùng `public.products`; không thêm member/owner filter, không gắn slug vào dữ liệu.
- Không seed/reset/xóa hàng loạt, không sửa schema, không chạy grants/RLS SQL. Người tổ chức quản lý cấu hình và quyền Supabase.
- Chỉ dùng Supabase từ backend qua context được inject. Không gọi Supabase từ browser.
- Sau mutation, frontend cần GET lại để đồng bộ với thay đổi của các thành viên khác.

## Cấu hình và an toàn

- Backend dùng `loadPublicConfig()` qua `server/supabase.js`; file mã hóa và `.lab/config.key` phải giữ nguyên vị trí.
- Không tạo plaintext config, env mới, secret/service_role, database password hoặc log giá trị config.
- Không phục vụ config, key, `server/`, `backend/`, `templates/` hay root repo dưới dạng static file.
- Không deploy, push hoặc merge nếu chưa được người tổ chức yêu cầu.

## Làm việc nhóm

- Trước khi sửa shared file, kiểm tra thay đổi đang có và hỏi trong nhóm nếu chủ sở hữu chưa rõ.
- Giữ API contract nhất quán: GET list 200; POST 201; PATCH 200; DELETE 204; lỗi JSON có `error.code` và `error.message`.
- Không đưa dữ liệu thật hoặc cấu hình vào log, prompt, screenshot hoặc commit.
- Khi kết thúc, nêu file đã sửa, lệnh kiểm tra đã chạy và các TODO còn lại.
