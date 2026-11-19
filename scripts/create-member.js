import { cp, lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2] || '';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Dùng slug chữ thường, số và gạch ngang, ví dụ: npm run member -- an-nguyen');
  process.exit(1);
}

const target = path.join(root, 'codeapi', slug);
try {
  await lstat(target);
  console.error(`Đã tồn tại: codeapi/${slug}. Không ghi đè bài hiện có.`);
  process.exit(1);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await mkdir(path.dirname(target), { recursive: true });
await cp(path.join(root, 'templates/member'), target, { recursive: true, errorOnExist: true, force: false });
const readmePath = path.join(target, 'README.md');
const readme = await readFile(readmePath, 'utf8');
await writeFile(readmePath, readme.replaceAll('{{SLUG}}', slug));
console.log(`Đã tạo codeapi/${slug}. Nếu server đang chạy, hãy restart server để mount backend và đưa bài vào gallery.`);
console.log(`Mở http://localhost:3000/codeapi/${slug}/ sau khi server chạy.`);
