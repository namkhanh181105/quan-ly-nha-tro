/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ TIN NHẮN LIÊN HỆ (ADMIN CONTACTS JS)
 * ============================================================================
 * - Nạp danh sách: GET backend/api/admin/contacts/list.php
 * - Cập nhật trạng thái: POST backend/api/admin/contacts/update_status.php
 * - Xóa tin nhắn: POST backend/api/admin/contacts/delete.php
 */

let currentPage = 1;
let currentFilters = {};
let contactModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Tin Nhắn Liên Hệ';

  contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
  await loadContacts(1);

  document.getElementById('contactFilterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFilters = {
      keyword: document.getElementById('filterKeyword').value.trim(),
      status: document.getElementById('filterStatus').value
    };
    loadContacts(1);
  });

  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('contactFilterForm').reset();
    currentFilters = {};
    loadContacts(1);
  });

  document.getElementById('contactActionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveContactStatus();
  });
});

async function loadContacts(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('contactsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải tin nhắn...</td></tr>';

  try {
    const res = await API.get('/admin/contacts/list.php', {
      page: currentPage,
      limit: 10,
      ...currentFilters
    });

    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderContactsTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${res.message || 'Lỗi tải tin nhắn.'}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-danger">Lỗi kết nối máy chủ.</td></tr>';
  }
}

function renderContactsTable(contacts) {
  const tbody = document.getElementById('contactsTableBody');
  if (!contacts || contacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Không có tin nhắn liên hệ nào.</td></tr>';
    return;
  }

  let html = '';
  contacts.forEach(c => {
    html += `
      <tr>
        <td><span class="text-muted fw-bold">#${c.id}</span></td>
        <td>
          <div class="fw-bold">${CONFIG.escapeHtml(c.fullname)}</div>
          <small class="text-muted"><i class="bi bi-telephone me-1"></i>${CONFIG.escapeHtml(c.phone)}</small>
          ${c.email ? `<div class="small text-muted"><i class="bi bi-envelope me-1"></i>${CONFIG.escapeHtml(c.email)}</div>` : ''}
        </td>
        <td><strong class="text-dark">${CONFIG.escapeHtml(c.subject || 'Tư vấn')}</strong></td>
        <td class="small text-muted" style="max-width: 280px;">${CONFIG.escapeHtml(c.message)}</td>
        <td>${CONFIG.getStatusBadge('contact', c.status)}</td>
        <td class="small text-muted">${CONFIG.escapeHtml(c.admin_notes || '---')}</td>
        <td class="small text-muted">${CONFIG.formatDateTime(c.created_at)}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-action-contact" data-id="${c.id}" data-name="${CONFIG.escapeHtml(c.fullname)}" data-phone="${CONFIG.escapeHtml(c.phone)}" data-email="${CONFIG.escapeHtml(c.email || '')}" data-subject="${CONFIG.escapeHtml(c.subject || '')}" data-msg="${CONFIG.escapeHtml(c.message)}" data-status="${c.status}" data-notes="${CONFIG.escapeHtml(c.admin_notes || '')}" title="Xem &amp; Phản hồi">
              <i class="bi bi-chat-left-dots"></i>
            </button>
            <button class="btn btn-outline-danger btn-delete-contact" data-id="${c.id}" title="Xóa">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-action-contact').forEach(btn => {
    btn.addEventListener('click', () => {
      openContactModal({
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        phone: btn.getAttribute('data-phone'),
        email: btn.getAttribute('data-email'),
        subject: btn.getAttribute('data-subject'),
        msg: btn.getAttribute('data-msg'),
        status: btn.getAttribute('data-status'),
        notes: btn.getAttribute('data-notes')
      });
    });
  });

  tbody.querySelectorAll('.btn-delete-contact').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteContact(btn.getAttribute('data-id'));
    });
  });
}

function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;
  const { page, total, total_pages } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} tin nhắn)`;

  if (total_pages <= 1) {
    listEl.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= total_pages; i++) {
    html += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  listEl.innerHTML = html;

  listEl.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const p = parseInt(link.getAttribute('data-page'));
      if (p && p !== currentPage) loadContacts(p);
    });
  });
}

function openContactModal(data) {
  document.getElementById('actionContactId').value = data.id;
  document.getElementById('actionContactStatus').value = data.status;
  document.getElementById('actionContactNotes').value = data.notes || '';
  document.getElementById('contactSenderBox').innerHTML = `
    <strong>Người gửi:</strong> ${data.name} (${data.phone})<br>
    ${data.email ? `<strong>Email:</strong> ${data.email}<br>` : ''}
    <strong>Chủ đề:</strong> ${data.subject}<br>
    <strong>Nội dung:</strong> <div class="mt-1 p-2 bg-white rounded border">${data.msg}</div>
  `;
  contactModal.show();
}

async function handleSaveContactStatus() {
  const id = document.getElementById('actionContactId').value;
  const status = document.getElementById('actionContactStatus').value;
  const admin_notes = document.getElementById('actionContactNotes').value.trim();
  const btnSave = document.getElementById('btnSaveContactStatus');

  try {
    const res = await API.post('/admin/contacts/update_status.php', {
      id: parseInt(id),
      status,
      admin_notes
    }, { buttonToDisable: btnSave });

    if (res && res.success) {
      CONFIG.showToast('Cập nhật trạng thái tin nhắn thành công.', 'success');
      contactModal.hide();
      await loadContacts(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Lỗi cập nhật.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ.', 'error');
  }
}

async function handleDeleteContact(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return;
  try {
    const res = await API.post('/admin/contacts/delete.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast('Đã xóa tin nhắn liên hệ.', 'success');
      await loadContacts(currentPage);
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi xóa tin nhắn.', 'error');
  }
}

