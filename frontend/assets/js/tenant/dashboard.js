/**
 * ==============================================================================
 * JAVASCRIPT BẢNG ĐIỀU KHIỂN CỔNG CƯ DÂN (TENANT DASHBOARD)
 * ==============================================================================
 * File: frontend/assets/js/tenant/dashboard.js
 * Nhiệm vụ:
 * 1. Kiểm tra quyền cư dân (Auth.requireTenant).
 * 2. Gọi GET backend/api/tenant/dashboard/summary.php để lấy:
 *    - Thông tin phòng đang thuê, giá thuê, tiền cọc.
 *    - Thời hạn hợp đồng, số ngày còn lại.
 *    - Trạng thái yêu cầu gia hạn/trả phòng.
 *    - Hóa đơn mới nhất kèm trạng thái thanh toán & duyệt minh chứng.
 *    - Danh sách bảo trì sự cố gần đây.
 *    - Bảng tin thông báo chung và cá nhân.
 * 3. Render giao diện tương ứng kèm thông báo cảnh báo nếu có hóa đơn nợ.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực đăng nhập Cổng Cư Dân
  const currentTenant = await Auth.requireTenant();
  if (!currentTenant) return;

  // ============================================================================
  // HÀM 1: TẢI DỮ LIỆU TỔNG QUAN TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadTenantDashboard
   * Giao diện gọi: Chạy tự động khi tải trang
   * API Backend: GET backend/api/tenant/dashboard/summary.php
   * Trả về: { success: true, data: { tenant, room, contract, latest_invoice, recent_maintenance, recent_notifications } }
   * Cập nhật UI: Đổ dữ liệu vào các thẻ thống kê, bảng hóa đơn và thông báo
   */
  async function loadTenantDashboard() {
    try {
      const res = await API.get('backend/api/tenant/dashboard/summary.php');

      if (res.success && res.data) {
        const d = res.data;
        renderTenantSummary(d);
        renderLatestInvoice(d.latest_invoice);
        renderRecentMaintenance(d.recent_maintenance || []);
        renderRecentNotifications(d.recent_notifications || []);
      } else {
        Utils.showToast(res.message || 'Không thể tải dữ liệu cư dân', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi tải trang tổng quan cư dân:', err);
      Utils.showToast('Lỗi máy chủ khi tải bảng điều khiển cư dân', 'danger');
    }
  }

  // ============================================================================
  // HÀM 2: RENDER THẺ THỐNG KÊ CƯ DÂN
  // ============================================================================
  function renderTenantSummary(d) {
    const tenant = d.tenant || d || {};
    const room = d.room || {
      room_number: tenant.room_number,
      category_name: tenant.room_title,
      floor: tenant.room_floor || 1,
      price: tenant.room_price
    };

    // Tiêu đề chào
    document.getElementById('dashWelcomeTitle').textContent = `Xin chào, ${tenant.fullname || 'Cư dân'}!`;

    // Thông tin phòng
    const roomNumber = room.room_number || tenant.room_number;
    if (roomNumber) {
      document.getElementById('dashRoomNumber').textContent = `Phòng ${roomNumber}`;
      document.getElementById('dashRoomCategory').textContent = `${room.category_name || 'Phòng Trọ'} - Tầng ${room.floor || 1}`;
      document.getElementById('dashRoomPrice').textContent = `${Utils.formatCurrency(room.price || tenant.room_price || 0)}/tháng`;
    } else {
      document.getElementById('dashRoomNumber').textContent = 'Chưa xếp phòng';
      document.getElementById('dashRoomCategory').textContent = 'Liên hệ BQL';
      document.getElementById('dashRoomPrice').textContent = '0 đ';
    }

    document.getElementById('dashDeposit').textContent = `Tiền cọc: ${Utils.formatCurrency(tenant.deposit_amount || 0)}`;

    // Thời hạn hợp đồng
    const startDate = tenant.contract_start || tenant.start_date;
    const endDate = tenant.contract_end || tenant.end_date;
    if (startDate && endDate) {
      document.getElementById('dashContractPeriod').textContent = `${Utils.formatDate(startDate)} - ${Utils.formatDate(endDate)}`;
      
      const endD = new Date(endDate);
      const today = new Date();
      const diffTime = endD - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        document.getElementById('dashContractDays').innerHTML = `<span class="badge bg-success-subtle text-success">Còn ${diffDays} ngày</span>`;
      } else {
        document.getElementById('dashContractDays').innerHTML = `<span class="badge bg-danger-subtle text-danger">Đã hết hạn hợp đồng</span>`;
      }
    } else {
      document.getElementById('dashContractPeriod').textContent = 'Không thời hạn';
      document.getElementById('dashContractDays').textContent = '--';
    }

    // Trạng thái gia hạn / rời đi
    const extEl = document.getElementById('dashExtensionStatus');
    if (tenant.extension_status === 'requested_extension') {
      extEl.innerHTML = '<span class="badge bg-primary">Đã gửi yêu cầu gia hạn</span>';
    } else if (tenant.extension_status === 'requested_leave') {
      extEl.innerHTML = '<span class="badge bg-danger">Đã xin trả phòng</span>';
    } else {
      extEl.innerHTML = '<span class="badge bg-light text-secondary border">Bình thường</span>';
    }
  }

  // ============================================================================
  // HÀM 3: RENDER HÓA ĐƠN MỚI NHẤT & CẢNH BÁO
  // ============================================================================
  function renderLatestInvoice(inv) {
    const container = document.getElementById('dashLatestInvoiceContainer');
    const alertBox = document.getElementById('dashInvoiceAlert');

    if (!inv) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-check-circle fs-3 text-success d-block mb-2"></i>
          Bạn hiện không có khoản hóa đơn nào cần thanh toán.
        </div>
      `;
      alertBox.classList.add('d-none');
      return;
    }

    // Cảnh báo nếu chưa thanh toán hoặc nợ một phần
    if (inv.status === 'unpaid' || inv.status === 'partially_paid') {
      alertBox.classList.remove('d-none');
      const debtAmount = inv.debt_amount !== undefined ? inv.debt_amount : (inv.total_amount - (inv.paid_amount || 0));
      alertBox.innerHTML = `
        <div class="alert alert-warning border-0 shadow-sm rounded-4 d-flex align-items-center justify-content-between p-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill fs-3 me-3 text-warning"></i>
            <div>
              <div class="fw-bold">Bạn có hóa đơn tháng ${inv.month}/${inv.year} chưa hoàn tất!</div>
              <div class="small">Số tiền còn thiếu: <strong class="text-danger">${Utils.formatCurrency(debtAmount)}</strong> (Hạn đóng: trước ngày 10 hàng tháng)</div>
            </div>
          </div>
          <a href="invoices.html" class="btn btn-warning btn-sm fw-bold">
            <i class="bi bi-upload me-1"></i> Nộp Bill Thanh Toán
          </a>
        </div>
      `;
    } else {
      alertBox.classList.add('d-none');
    }

    // Hiển thị chi tiết hóa đơn gần nhất
    const statusBadge = Utils.getInvoiceStatusBadge(inv.status);
    const proofBadge = Utils.getProofStatusBadge(inv.payment_proof_status);

    container.innerHTML = `
      <div class="p-3 border rounded-3 bg-light">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold text-dark fs-6">Hóa đơn tháng ${inv.month}/${inv.year}</span>
          <div>${statusBadge} ${proofBadge}</div>
        </div>
        <div class="row g-2 small text-muted mb-3">
          <div class="col-6">Tiền phòng: <strong class="text-dark">${Utils.formatCurrency(inv.room_price || 0)}</strong></div>
          <div class="col-6">Tiền điện: <strong class="text-dark">${Utils.formatCurrency(inv.electricity_cost || 0)}</strong></div>
          <div class="col-6">Tiền nước: <strong class="text-dark">${Utils.formatCurrency(inv.water_cost || 0)}</strong></div>
          <div class="col-6">Dịch vụ khác: <strong class="text-dark">${Utils.formatCurrency(inv.service_cost || 0)}</strong></div>
        </div>
        <div class="d-flex justify-content-between align-items-center pt-2 border-top">
          <span class="fw-bold text-dark">Tổng tiền: <span class="text-danger fs-5">${Utils.formatCurrency(inv.total_amount)}</span></span>
          <a href="invoices.html" class="btn btn-primary btn-sm fw-semibold">
            <i class="bi bi-receipt me-1"></i> Xem chi tiết / Nộp bill
          </a>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // HÀM 4: RENDER BẢNG BÁO HỎNG GẦN ĐÂY
  // ============================================================================
  function renderRecentMaintenance(list) {
    const tbody = document.getElementById('dashMaintenanceTableBody');
    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-muted">Chưa có yêu cầu sửa chữa nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.slice(0, 4).map(m => {
      let badge = '';
      if (m.status === 'pending') badge = '<span class="badge bg-warning text-dark">Chờ tiếp nhận</span>';
      else if (m.status === 'processing') badge = '<span class="badge bg-primary">Đang sửa</span>';
      else if (m.status === 'completed') badge = '<span class="badge bg-success">Đã sửa xong</span>';
      else badge = '<span class="badge bg-secondary">Đã hủy</span>';

      return `
        <tr>
          <td class="fw-semibold text-dark text-truncate" style="max-width: 180px;">${Utils.escapeHtml(m.title)}</td>
          <td class="small text-muted">${Utils.formatDate(m.created_at)}</td>
          <td>${badge}</td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // HÀM 5: RENDER THÔNG BÁO TÒA NHÀ GẦN ĐÂY
  // ============================================================================
  function renderRecentNotifications(list) {
    const container = document.getElementById('dashNotificationsContainer');
    if (!list || list.length === 0) {
      container.innerHTML = `<div class="text-center py-4 text-muted">Hiện chưa có thông báo mới từ tòa nhà.</div>`;
      return;
    }

    container.innerHTML = list.slice(0, 4).map(n => {
      const isGeneral = !n.tenant_id;
      const typeBadge = isGeneral 
        ? '<span class="badge bg-secondary-subtle text-secondary small">Chung</span>' 
        : '<span class="badge bg-info-subtle text-info small">Cá nhân</span>';

      return `
        <div class="list-group-item px-0 py-3 border-bottom">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-bold text-dark small">${Utils.escapeHtml(n.title)}</span>
            ${typeBadge}
          </div>
          <p class="text-secondary small mb-1 line-clamp-2">${Utils.escapeHtml(n.message)}</p>
          <div class="small text-muted" style="font-size: 0.75rem;">
            <i class="bi bi-clock me-1"></i>${Utils.formatDateTime(n.created_at)}
          </div>
        </div>
      `;
    }).join('');
  }

  // Khởi chạy
  loadTenantDashboard();
});

