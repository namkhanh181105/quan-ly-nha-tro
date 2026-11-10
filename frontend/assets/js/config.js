/**
 * ============================================================================
 * CẤU HÌNH VÀ HÀM TIỆN ÍCH FRONTEND (CONFIG & UTILS)
 * ============================================================================
 * Tự động phát hiện URL gốc (Base URL), định dạng tiền tệ VNĐ, ngày tháng,
 * chống XSS, hiển thị Toast thông báo và chuyển đổi ENUM sang nhãn tiếng Việt.
 */

const getAppBaseUrl = () => {
  const path = window.location.pathname;
  const idx = path.indexOf('/frontend/');
  if (idx !== -1) {
    return window.location.origin + path.substring(0, idx);
  }
  return window.location.origin;
};

const CONFIG = {
  BASE_URL: getAppBaseUrl(),
  API_URL: getAppBaseUrl() + '/backend/api',
  UPLOADS_URL: getAppBaseUrl() + '/uploads',

  /**
   * Định dạng số tiền VNĐ (Ví dụ: 3.200.000 đ)
   */
  formatCurrency: (amount) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  },

  /**
   * Định dạng ngày tháng DD/MM/YYYY
   */
  formatDate: (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  /**
   * Định dạng ngày giờ DD/MM/YYYY HH:mm
   */
  formatDateTime: (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  },

  /**
   * Lọc ký tự nguy hiểm chống XSS khi render chuỗi vào HTML
   */
  escapeHtml: (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Hiển thị thông báo Toast nổi
   * @param {string} message Nội dung thông báo
   * @param {string} type 'success', 'error', 'warning', 'info'
   */
  showToast: (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const toastType = (type === 'danger') ? 'error' : type;
    toast.className = `custom-toast toast-${toastType}`;

    let icon = 'bi-check-circle-fill text-success';
    if (type === 'error' || type === 'danger')   icon = 'bi-exclamation-triangle-fill text-danger';
    if (type === 'warning') icon = 'bi-exclamation-circle-fill text-warning';
    if (type === 'info')    icon = 'bi-info-circle-fill text-primary';

    toast.innerHTML = `
      <i class="bi ${icon} fs-5"></i>
      <div class="flex-grow-1 text-sm font-medium">${CONFIG.escapeHtml(message)}</div>
      <button type="button" class="btn-close btn-close-sm" aria-label="Close"></button>
    `;

    toast.querySelector('.btn-close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  /**
   * Trả về HTML Huy hiệu trạng thái với nhãn tiếng Việt chuẩn xác
   */
  getStatusBadge: (category, status) => {
    const s = String(status).toLowerCase();
    switch (category) {
      case 'room':
        if (s === 'available')   return '<span class="badge-status badge-room-available"><i class="bi bi-check-circle"></i> Còn trống</span>';
        if (s === 'rented')      return '<span class="badge-status badge-room-rented"><i class="bi bi-people"></i> Đã thuê</span>';
        if (s === 'maintenance') return '<span class="badge-status badge-room-maintenance"><i class="bi bi-tools"></i> Đang bảo trì</span>';
        break;

      case 'invoice':
        if (s === 'paid')           return '<span class="badge-status badge-invoice-paid"><i class="bi bi-check-all"></i> Đã thanh toán</span>';
        if (s === 'partially_paid') return '<span class="badge-status badge-invoice-partially_paid"><i class="bi bi-clock-history"></i> Còn nợ</span>';
        if (s === 'unpaid')         return '<span class="badge-status badge-invoice-unpaid"><i class="bi bi-x-circle"></i> Chưa thanh toán</span>';
        break;

      case 'proof':
        if (s === 'none')     return '<span class="badge-status badge-proof-none">Chưa nộp bill</span>';
        if (s === 'pending')  return '<span class="badge-status badge-proof-pending"><i class="bi bi-hourglass-split"></i> Chờ duyệt bill</span>';
        if (s === 'approved') return '<span class="badge-status badge-proof-approved"><i class="bi bi-check-circle"></i> Đã duyệt bill</span>';
        if (s === 'rejected') return '<span class="badge-status badge-proof-rejected"><i class="bi bi-x-circle"></i> Từ chối bill</span>';
        break;

      case 'booking':
        if (s === 'pending')   return '<span class="badge-status badge-booking-pending">Chờ xử lý</span>';
        if (s === 'contacted') return '<span class="badge-status badge-booking-contacted">Đã liên hệ</span>';
        if (s === 'approved')  return '<span class="badge-status badge-booking-approved">Đã xác nhận</span>';
        if (s === 'cancelled') return '<span class="badge-status badge-booking-cancelled">Đã hủy</span>';
        break;

      case 'maintenance':
        if (s === 'pending')    return '<span class="badge-status badge-maint-pending">Chờ tiếp nhận</span>';
        if (s === 'processing') return '<span class="badge-status badge-maint-processing">Đang xử lý</span>';
        if (s === 'completed')  return '<span class="badge-status badge-maint-completed">Đã hoàn thành</span>';
        if (s === 'cancelled')  return '<span class="badge-status badge-maint-cancelled">Đã hủy</span>';
        break;

      case 'urgency':
        if (s === 'normal')    return '<span class="badge-status badge-urgency-normal">Bình thường</span>';
        if (s === 'urgent')    return '<span class="badge-status badge-urgency-urgent">Khẩn cấp</span>';
        if (s === 'emergency') return '<span class="badge-status badge-urgency-emergency">Cực kỳ khẩn cấp</span>';
        break;

      case 'contact':
        if (s === 'new')       return '<span class="badge-status badge-booking-pending">Mới gửi</span>';
        if (s === 'read')      return '<span class="badge-status badge-booking-contacted">Đã xem</span>';
        if (s === 'contacted') return '<span class="badge-status badge-booking-approved">Đã phản hồi</span>';
        break;

      case 'tenant_status':
        if (s === 'active') return '<span class="badge-status badge-room-available">Đang thuê</span>';
        if (s === 'ended')  return '<span class="badge-status badge-room-rented">Đã trả phòng</span>';
        break;

      case 'portal_status':
        return (Number(status) === 1)
          ? '<span class="badge-status badge-room-available">Hoạt động</span>'
          : '<span class="badge-status badge-room-rented">Bị khóa</span>';

      case 'extension':
        if (s === 'requested_extension') return '<span class="badge-status badge-booking-pending">Xin gia hạn</span>';
        if (s === 'requested_leave')     return '<span class="badge-status badge-urgency-urgent">Xin trả phòng</span>';
        return '<span class="badge-status badge-proof-none">Bình thường</span>';
    }

    return `<span class="badge bg-secondary">${CONFIG.escapeHtml(status)}</span>`;
  }
};

// Aliases cho tương thích ngược giữa các module
window.CONFIG = CONFIG;
window.APP_CONFIG = CONFIG;
window.Utils = {
  ...CONFIG,
  getInvoiceStatusBadge: (status) => CONFIG.getStatusBadge('invoice', status),
  getProofStatusBadge: (status) => CONFIG.getStatusBadge('proof', status),
  getBookingStatusBadge: (status) => CONFIG.getStatusBadge('booking', status),
  getMaintenanceStatusBadge: (status) => CONFIG.getStatusBadge('maintenance', status),
  getRoomStatusBadge: (status) => CONFIG.getStatusBadge('room', status),
  getPortalStatusBadge: (status) => CONFIG.getStatusBadge('portal_status', status),
  getExtensionBadge: (status) => CONFIG.getStatusBadge('extension', status)
};


