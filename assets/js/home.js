const list = document.querySelector('#member-list');
const status = document.querySelector('#members-status');
const reload = document.querySelector('#reload-members');

function renderMembers(members) {
  list.replaceChildren();
  if (!members.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Chưa có bài thành viên. Tạo bằng npm run member -- <slug>, rồi restart server để mount bài mới.';
    list.append(empty);
    return;
  }
  for (const member of members) {
    const row = document.createElement('article');
    row.className = 'member-row';
    const identity = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'member-name';
    name.textContent = member.name;
    const slug = document.createElement('div');
    slug.className = 'member-slug';
    slug.textContent = `/codeapi/${member.slug}/`;
    identity.append(name, slug);
    const link = document.createElement('a');
    link.className = 'btn btn-secondary btn-small';
    link.href = member.href;
    link.textContent = 'Mở bài';
    row.append(identity, link);
    list.append(row);
  }
}

async function loadMembers() {
  status.className = 'status';
  status.textContent = 'Đang tải danh sách…';
  reload.disabled = true;
  try {
    const response = await fetch('/api/members', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Không tải được danh sách bài.');
    const members = await response.json();
    renderMembers(members);
    status.textContent = `${members.length} bài được tìm thấy.`;
  } catch {
    status.className = 'status error';
    status.textContent = 'Không đọc được danh sách. Hãy thử tải lại.';
  } finally {
    reload.disabled = false;
  }
}

reload.addEventListener('click', loadMembers);
loadMembers();
