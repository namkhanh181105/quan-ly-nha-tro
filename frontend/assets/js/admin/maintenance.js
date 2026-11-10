/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ BẢO TRÌ SỬA CHỮA (ADMIN MAINTENANCE JS)
 * ============================================================================
 * - Nạp danh sách sự cố: GET backend/api/admin/maintenance/list.php
 * - Xem chi tiết: GET backend/api/admin/maintenance/detail.php
 * - Cập nhật tiến độ: POST backend/api/admin/maintenance/update.php
 */

let currentPage = 1;
let currentFilters = {};
let ticketModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Yêu Cầu Sửa Chữa & Bảo Trì';

  ticketModal = new bootstrap.Modal(document.getElementById('ticketModal'));
  await loadRequests(1);

  document.getElementById('maintenanceFilterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFilters = {
      keyword: document.getElementById('filterKeyword').value.trim(),
      category: document.getElementById('filterCategory').value,
      urgency: document.getElementById('filterUrgency').value,
      status: document.getElementById('filterStatus').value
    };
    loadRequests(1);
  });

  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('maintenanceFilterForm').reset();
    currentFilters = {};
    loadRequests(1);
  });

  document.getElementById('ticketActionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveTicket();
  });
});

async function loadRequests(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('maintTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải...</td></tr>';

  try {
    const res = await API.get('/admin/maintenance/list.php', {
      page: currentPage,
      limit: 10,
      ...currentFilters
    });

    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${res.message || 'Lỗi tải danh sách.'}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-danger">Lỗi kết nối máy chủ.</td></tr>';
  }
}

function renderTable(tickets) {
  const tbody = document.getElementById('maintTableBody');
  if (!tickets || tickets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Không có yêu cầu bảo trì nào.</td></tr>';
    return;
  }

  let html = '';
  tickets.forEach(t => {
    html += `
      <tr>
        <td>
          <strong class="text-primary font-monospace">${CONFIG.escapeHtml(t.ticket_code)}</strong>
          <div class="small text-muted">${CONFIG.formatDate(t.created_at)}</div>
        </td>
        <td>
          <span class="badge bg-dark">P.${CONFIG.escapeHtml(t.room_number)}</span>
          <div class="fw-semibold small">${CONFIG.escapeHtml(t.tenant_name)}</div>
          <small class="text-muted">${CONFIG.escapeHtml(t.tenant_phone)}</small>
        </td>
        <td>
          <span class="badge bg-secondary-subtle text-dark border mb-1">${CONFIG.escapeHtml(t.category)}</span>
          <div class="small text-muted" style="max-width: 250px;">${CONFIG.escapeHtml(t.description)}</div>
        </td>
        <td>${CONFIG.getStatusBadge('urgency', t.urgency)}</td>
        <td class="small text-muted">${CONFIG.escapeHtml(t.preferred_time || 'Giờ hành chính')}</td>
        <td class="small">
          ${t.assigned_technician ? `<strong class="text-success"><i class="bi bi-person-check me-1"></i>${CONFIG.escapeHtml(t.assigned_technician)}</strong>` : '<span class="text-muted">Chưa giao thợ</span>'}
        </td>
        <td>${CONFIG.getStatusBadge('maintenance', t.status)}</td>
        <td class="text-center">
          <button class="btn btn-outline-primary btn-sm btn-edit-ticket" data-id="${t.id}" title="Điều phối / Cập nhật tiến độ">
            <i class="bi bi-tools me-1"></i> Xử lý
          </button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-edit-ticket').forEach(btn => {
    btn.addEventListener('click', () => openTicketModal(btn.getAttribute('data-id')));
  });
}

function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;
  const { page, total, total_pages } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} phiếu)`;

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
      if (p && p !== currentPage) loadRequests(p);
    });
  });
}

async function openTicketModal(id) {
  try {
    API.showLoading();
    const res = await API.get('/admin/maintenance/detail.php', { id });
    if (res && res.success && res.data) {
      const t = res.data;
      document.getElementById('actionTicketId').value = t.id;
      document.getElementById('actionTechnician').value = t.assigned_technician || '';
      document.getElementById('actionTicketStatus').value = t.status;
      document.getElementById('actionAdminNotes').value = t.admin_notes || '';
      document.getElementById('ticketModalTitle').textContent = `Điều phối sự cố ${t.ticket_code}`;

      document.getElementById('ticketDetailsBox').innerHTML = `
        <strong>Mã phiếu:</strong> ${CONFIG.escapeHtml(t.ticket_code)} | <strong>Phòng:</strong> P.${CONFIG.escapeHtml(t.room_number)}<br>
        <strong>Cư dân báo:</strong> ${CONFIG.escapeHtml(t.tenant_name)} (${CONFIG.escapeHtml(t.tenant_phone)})<br>
        <strong>Hạng mục:</strong> ${CONFIG.escapeHtml(t.category)} | <strong>Mức độ:</strong> ${CONFIG.getStatusBadge('urgency', t.urgency)}<br>
        <strong>Thời gian thuận tiện:</strong> ${CONFIG.escapeHtml(t.preferred_time || 'Giờ hành chính')}<br>
        <strong>Mô tả sự cố:</strong> <div class="mt-1 p-2 bg-white rounded border">${CONFIG.escapeHtml(t.description)}</div>
      `;

      ticketModal.show();
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi tải chi tiết phiếu bảo trì.', 'error');
  } finally {
    API.hideLoading();
  }
}

async function handleSaveTicket() {
  const id = document.getElementById('actionTicketId').value;
  const status = document.getElementById('actionTicketStatus').value;
  const assigned_technician = document.getElementById('actionTechnician').value.trim();
  const admin_notes = document.getElementById('actionAdminNotes').value.trim();
  const btnSave = document.getElementById('btnSaveTicket');

  try {
    const res = await API.post('/admin/maintenance/update.php', {
      id: parseInt(id),
      status,
      assigned_technician,
      admin_notes
    }, { buttonToDisable: btnSave });

    if (res && res.success) {
      CONFIG.showToast(res.message || 'Cập nhật tiến độ thành công!', 'success');
      ticketModal.hide();
      await loadRequests(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Lỗi cập nhật phiếu.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ.', 'error');
  }
}

