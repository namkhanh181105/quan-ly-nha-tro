/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ THÔNG BÁO (ADMIN NOTIFICATIONS JS)
 * ============================================================================
 * - Nạp danh sách thông báo: GET backend/api/admin/notifications/list.php
 * - Phát thông báo mới: POST backend/api/admin/notifications/create.php
 * - Xóa thông báo: POST backend/api/admin/notifications/delete.php
 */

let currentPage = 1;
let notiModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Bảng Tin & Thông Báo Cư Dân';

  notiModal = new bootstrap.Modal(document.getElementById('notificationModal'));

  await loadTenantsDropdown();
  await loadNotifications(1);

  document.getElementById('btnNewNotification').addEventListener('click', () => {
    document.getElementById('notificationForm').reset();
    document.getElementById('notifTenantGroup').style.display = 'none';
    notiModal.show();
  });

  // Chuyển đổi hiển thị chọn cư dân khi chọn target_type
  document.getElementById('notifTargetType').addEventListener('change', (e) => {
    const isIndiv = (e.target.value === 'individual');
    document.getElementById('notifTenantGroup').style.display = isIndiv ? 'block' : 'none';
    if (isIndiv) {
      document.getElementById('notifTenantId').setAttribute('required', 'required');
    } else {
      document.getElementById('notifTenantId').removeAttribute('required');
    }
  });

  document.getElementById('notificationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCreateNotification();
  });
});

async function loadTenantsDropdown() {
  try {
    const res = await API.get('/admin/tenants/list.php', { status: 'active', limit: 50 });
    if (res && res.success && res.data) {
      const select = document.getElementById('notifTenantId');
      select.innerHTML = '<option value="">-- Chọn cư dân nhận --</option>';
      res.data.items.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${CONFIG.escapeHtml(t.fullname)} - Phòng P.${CONFIG.escapeHtml(t.room_number || '')}</option>`;
      });
    }
  } catch (e) {
    console.error('Lỗi nạp dropdown cư dân:', e);
  }
}

async function loadNotifications(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('notificationsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải thông báo...</td></tr>';

  try {
    const res = await API.get('/admin/notifications/list.php', { page: currentPage, limit: 15 });
    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">${res.message || 'Lỗi tải.'}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">Lỗi kết nối máy chủ.</td></tr>';
  }
}

function renderTable(items) {
  const tbody = document.getElementById('notificationsTableBody');
  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Chưa có thông báo nào.</td></tr>';
    return;
  }

  let html = '';
  items.forEach(n => {
    const isBroadcast = !n.tenant_id;
    const targetBadge = isBroadcast
      ? '<span class="badge bg-primary"><i class="bi bi-broadcast me-1"></i> Toàn tòa nhà</span>'
      : `<span class="badge bg-info text-dark"><i class="bi bi-person me-1"></i> P.${CONFIG.escapeHtml(n.room_number || '')} - ${CONFIG.escapeHtml(n.tenant_name || '')}</span>`;

    html += `
      <tr>
        <td><span class="text-muted fw-bold">#${n.id}</span></td>
        <td>${targetBadge}</td>
        <td><span class="badge bg-light text-dark border">${CONFIG.escapeHtml(n.type)}</span></td>
        <td><strong>${CONFIG.escapeHtml(n.title)}</strong></td>
        <td class="small text-muted" style="max-width: 320px;">${CONFIG.escapeHtml(n.content)}</td>
        <td class="small text-muted">${CONFIG.formatDateTime(n.created_at)}</td>
        <td class="text-center">
          <button class="btn btn-outline-danger btn-sm btn-delete-notif" data-id="${n.id}" title="Xóa thông báo">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-delete-notif').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteNotification(btn.getAttribute('data-id')));
  });
}

function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;
  const { page, total, total_pages } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} thông báo)`;

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
      if (p && p !== currentPage) loadNotifications(p);
    });
  });
}

async function handleCreateNotification() {
  const targetType = document.getElementById('notifTargetType').value;
  const tenantId = (targetType === 'individual') ? document.getElementById('notifTenantId').value : null;
  const type = document.getElementById('notifType').value;
  const title = document.getElementById('notifTitle').value.trim();
  const content = document.getElementById('notifContent').value.trim();
  const btnSave = document.getElementById('btnSaveNotification');

  try {
    const res = await API.post('/admin/notifications/create.php', {
      target_type: targetType,
      tenant_id: tenantId,
      type,
      title,
      content
    }, { buttonToDisable: btnSave });

    if (res && res.success) {
      CONFIG.showToast('Phát thông báo thành công!', 'success');
      notiModal.hide();
      await loadNotifications(1);
    } else {
      CONFIG.showToast(res.message || 'Lỗi khi phát thông báo.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ.', 'error');
  }
}

async function handleDeleteNotification(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
  try {
    const res = await API.post('/admin/notifications/delete.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast('Đã xóa thông báo.', 'success');
      await loadNotifications(currentPage);
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi xóa thông báo.', 'error');
  }
}

