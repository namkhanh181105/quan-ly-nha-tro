/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ LỊCH HẸN XEM PHÒNG (ADMIN BOOKINGS JS)
 * ============================================================================
 * - Nạp danh sách: GET backend/api/admin/bookings/list.php
 * - Cập nhật trạng thái: POST backend/api/admin/bookings/update_status.php
 * - Xóa: POST backend/api/admin/bookings/delete.php
 */

let currentPage = 1;
let currentFilters = {};
let actionModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Lịch Hẹn Xem Phòng';

  actionModal = new bootstrap.Modal(document.getElementById('bookingActionModal'));
  await loadBookings(1);

  document.getElementById('bookingFilterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFilters = {
      keyword: document.getElementById('filterKeyword').value.trim(),
      status: document.getElementById('filterStatus').value
    };
    loadBookings(1);
  });

  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('bookingFilterForm').reset();
    currentFilters = {};
    loadBookings(1);
  });

  document.getElementById('bookingActionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveBookingStatus();
  });
});

async function loadBookings(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('bookingsTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải lịch hẹn...</td></tr>';

  try {
    const res = await API.get('/admin/bookings/list.php', {
      page: currentPage,
      limit: 10,
      ...currentFilters
    });

    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderBookingsTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${res.message || 'Lỗi tải lịch hẹn.'}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-danger">Lỗi kết nối máy chủ.</td></tr>';
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Không có lịch hẹn xem phòng nào.</td></tr>';
    return;
  }

  let html = '';
  bookings.forEach(b => {
    html += `
      <tr>
        <td><span class="text-muted fw-bold">#${b.id}</span></td>
        <td>
          <div class="fw-bold">${CONFIG.escapeHtml(b.customer_name)}</div>
          <small class="text-muted"><i class="bi bi-telephone me-1"></i>${CONFIG.escapeHtml(b.customer_phone)}</small>
          ${b.customer_email ? `<div class="small text-muted"><i class="bi bi-envelope me-1"></i>${CONFIG.escapeHtml(b.customer_email)}</div>` : ''}
        </td>
        <td>
          <span class="badge bg-dark">P.${CONFIG.escapeHtml(b.room_number || '')}</span>
          <div class="small text-muted">${CONFIG.escapeHtml(b.room_title || '')}</div>
        </td>
        <td><strong class="text-primary"><i class="bi bi-calendar-event me-1"></i>${CONFIG.formatDate(b.appointment_date)}</strong></td>
        <td class="small text-muted" style="max-width: 250px;">${CONFIG.escapeHtml(b.note || '---')}</td>
        <td>${CONFIG.getStatusBadge('booking', b.status)}</td>
        <td class="small text-muted">${CONFIG.formatDateTime(b.created_at)}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-action-booking" data-id="${b.id}" data-name="${CONFIG.escapeHtml(b.customer_name)}" data-phone="${CONFIG.escapeHtml(b.customer_phone)}" data-room="${CONFIG.escapeHtml(b.room_number || '')}" data-status="${b.status}" title="Xử lý">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-outline-danger btn-delete-booking" data-id="${b.id}" title="Xóa">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;

  tbody.querySelectorAll('.btn-action-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      openActionModal({
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        phone: btn.getAttribute('data-phone'),
        room: btn.getAttribute('data-room'),
        status: btn.getAttribute('data-status')
      });
    });
  });

  tbody.querySelectorAll('.btn-delete-booking').forEach(btn => {
    btn.addEventListener('click', () => {
      handleDeleteBooking(btn.getAttribute('data-id'));
    });
  });
}

function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;
  const { page, total, total_pages } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} lịch hẹn)`;

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
      if (p && p !== currentPage) loadBookings(p);
    });
  });
}

function openActionModal(data) {
  document.getElementById('actionBookingId').value = data.id;
  document.getElementById('actionBookingStatus').value = data.status;
  document.getElementById('actionBookingNote').value = '';
  document.getElementById('bookingCustomerInfo').innerHTML = `
    <strong>Khách hẹn:</strong> ${data.name} (${data.phone})<br>
    <strong>Đăng ký xem phòng:</strong> Phòng ${data.room}
  `;
  actionModal.show();
}

async function handleSaveBookingStatus() {
  const id = document.getElementById('actionBookingId').value;
  const status = document.getElementById('actionBookingStatus').value;
  const note = document.getElementById('actionBookingNote').value.trim();
  const btnSave = document.getElementById('btnSaveBookingStatus');

  try {
    const res = await API.post('/admin/bookings/update_status.php', {
      id: parseInt(id),
      status,
      note
    }, { buttonToDisable: btnSave });

    if (res && res.success) {
      CONFIG.showToast('Cập nhật trạng thái lịch hẹn thành công.', 'success');
      actionModal.hide();
      await loadBookings(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Lỗi cập nhật.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ.', 'error');
  }
}

async function handleDeleteBooking(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) return;
  try {
    const res = await API.post('/admin/bookings/delete.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast('Đã xóa lịch hẹn thành công.', 'success');
      await loadBookings(currentPage);
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi xóa lịch hẹn.', 'error');
  }
}

