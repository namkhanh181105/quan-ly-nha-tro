/**
 * ==============================================================================
 * JAVASCRIPT XEM LỊCH HẸN VÀ LIÊN HỆ CỦA KHÁCH HÀNG (CUSTOMER BOOKINGS & CONTACTS)
 * ==============================================================================
 * File: frontend/assets/js/customer/bookings.js
 * Nhiệm vụ:
 * 1. Xác thực quyền khách hàng (Auth.requireUser).
 * 2. Tải danh sách lịch hẹn: GET backend/api/customer/bookings/list.php.
 * 3. Tải danh sách liên hệ đã gửi: GET backend/api/customer/contacts/list.php.
 * 4. Bắt sự kiện các nút tải lại #btnReloadBookings và #btnReloadContacts.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực đăng nhập
  const currentUser = await Auth.requireUser();
  if (!currentUser) return;

  // ============================================================================
  // HÀM 1: TẢI DANH SÁCH LỊCH HẸN XEM PHÒNG
  // ============================================================================
  /**
   * Tên hàm: loadCustomerBookings
   * Giao diện gọi: Khi tải trang hoặc khi bấm #btnReloadBookings
   * API Backend: GET backend/api/customer/bookings/list.php
   * Trả về: { success: true, data: [...] }
   * Cập nhật UI: Đổ các dòng <tr> vào #customerBookingsTableBody
   */
  async function loadCustomerBookings() {
    const tbody = document.getElementById('customerBookingsTableBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải danh sách lịch hẹn...
        </td>
      </tr>
    `;

    try {
      const res = await API.get('backend/api/customer/bookings/list.php');
      if (res.success && Array.isArray(res.data)) {
        renderBookingsTable(res.data);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4 text-danger">
              ${res.message || 'Không thể tải danh sách lịch hẹn.'}
            </td>
          </tr>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải lịch hẹn:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-danger">
            Đã có lỗi xảy ra khi kết nối máy chủ.
          </td>
        </tr>
      `;
    }
  }

  // ============================================================================
  // HÀM 2: RENDER BẢNG LỊCH HẸN
  // ============================================================================
  function renderBookingsTable(bookings) {
    const tbody = document.getElementById('customerBookingsTableBody');
    if (!bookings || bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            Bạn chưa đăng ký lịch hẹn xem phòng nào. 
            <a href="../public/rooms.html" class="fw-semibold">Tìm phòng ngay</a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      let statusBadge = '';
      if (b.status === 'pending') {
        statusBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Chờ xác nhận</span>';
      } else if (b.status === 'confirmed') {
        statusBadge = '<span class="badge bg-primary"><i class="bi bi-check-circle me-1"></i>Đã xác nhận</span>';
      } else if (b.status === 'completed') {
        statusBadge = '<span class="badge bg-success"><i class="bi bi-check2-all me-1"></i>Đã dẫn xem</span>';
      } else {
        statusBadge = '<span class="badge bg-secondary"><i class="bi bi-x-circle me-1"></i>Đã hủy</span>';
      }

      const roomLink = b.room_id 
        ? `<a href="../public/room-detail.html?id=${b.room_id}" class="fw-bold text-decoration-none">Phòng ${Utils.escapeHtml(b.room_number || '')}</a>` 
        : '<span class="text-muted">Không xác định</span>';

      return `
        <tr>
          <td class="text-muted fw-bold">#${b.id}</td>
          <td>
            ${roomLink}
            <div class="small text-muted">${Utils.escapeHtml(b.category_name || '')}</div>
          </td>
          <td>
            <div class="fw-semibold text-dark"><i class="bi bi-calendar3 me-1 text-primary"></i>${Utils.formatDate(b.booking_date)}</div>
            <div class="small text-muted"><i class="bi bi-clock me-1"></i>${b.booking_time ? b.booking_time.substring(0, 5) : ''}</div>
          </td>
          <td class="small text-secondary">${Utils.escapeHtml(b.note || 'Không có')}</td>
          <td>${statusBadge}</td>
          <td class="small text-muted">${Utils.formatDateTime(b.created_at)}</td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // HÀM 3: TẢI DANH SÁCH TIN NHẮN LIÊN HỆ ĐÃ GỬI
  // ============================================================================
  /**
   * Tên hàm: loadCustomerContacts
   * Giao diện gọi: Khi tải trang hoặc khi bấm #btnReloadContacts
   * API Backend: GET backend/api/customer/contacts/list.php
   * Trả về: { success: true, data: [...] }
   * Cập nhật UI: Đổ dữ liệu vào #customerContactsTableBody
   */
  async function loadCustomerContacts() {
    const tbody = document.getElementById('customerContactsTableBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải tin nhắn...
        </td>
      </tr>
    `;

    try {
      const res = await API.get('backend/api/customer/contacts/list.php');
      if (res.success && Array.isArray(res.data)) {
        renderContactsTable(res.data);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-4 text-danger">
              ${res.message || 'Không thể tải tin nhắn liên hệ.'}
            </td>
          </tr>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải liên hệ:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-danger">
            Đã có lỗi xảy ra khi kết nối máy chủ.
          </td>
        </tr>
      `;
    }
  }

  // ============================================================================
  // HÀM 4: RENDER BẢNG TIN NHẮN LIÊN HỆ
  // ============================================================================
  function renderContactsTable(contacts) {
    const tbody = document.getElementById('customerContactsTableBody');
    if (!contacts || contacts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">
            Bạn chưa gửi tin nhắn liên hệ nào tới ban quản lý.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = contacts.map(c => {
      let statusBadge = '';
      if (c.status === 'new') {
        statusBadge = '<span class="badge bg-warning text-dark">BQL chưa xem</span>';
      } else if (c.status === 'replied') {
        statusBadge = '<span class="badge bg-success">BQL đã phản hồi</span>';
      } else {
        statusBadge = '<span class="badge bg-secondary">Đã đóng</span>';
      }

      return `
        <tr>
          <td class="text-muted fw-bold">#${c.id}</td>
          <td class="fw-semibold text-dark">${Utils.escapeHtml(c.subject)}</td>
          <td class="small text-secondary" style="max-width: 320px;">
            ${Utils.escapeHtml(c.message)}
          </td>
          <td>${statusBadge}</td>
          <td class="small text-muted">${Utils.formatDateTime(c.created_at)}</td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // SỰ KIỆN NÚT TẢI LẠI
  // ============================================================================
  document.getElementById('btnReloadBookings').addEventListener('click', loadCustomerBookings);
  document.getElementById('btnReloadContacts').addEventListener('click', loadCustomerContacts);

  // Khởi chạy nạp dữ liệu ban đầu
  loadCustomerBookings();
  loadCustomerContacts();
});

