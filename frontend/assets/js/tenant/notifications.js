/**
 * ==============================================================================
 * JAVASCRIPT BẢNG TIN THÔNG BÁO DÀNH CHO CƯ DÂN (TENANT NOTIFICATIONS)
 * ==============================================================================
 * File: frontend/assets/js/tenant/notifications.js
 * Nhiệm vụ:
 * 1. Kiểm tra xác thực Cư dân (Auth.requireTenant).
 * 2. Tải danh sách thông báo: GET backend/api/tenant/notifications/list.php.
 * 3. Hỗ trợ lọc theo tab: Tất cả, Thông báo chung tòa nhà, Thông báo cá nhân.
 * 4. Bắt sự kiện đánh dấu đã đọc thông báo cá nhân (.btn-mark-read):
 *    - Gửi POST backend/api/tenant/notifications/mark_read.php với payload { id }.
 *    - Cập nhật huy hiệu đã đọc trên giao diện.
 * Lưu ý theo cấu trúc CSDL: Thông báo chung (tenant_id IS NULL) không thể lưu trạng thái đã đọc theo từng cá nhân
 * mà không sửa đổi schema CSDL. Do đó hệ thống chỉ cho phép cập nhật đã đọc đối với thông báo cá nhân.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực cư dân
  const currentTenant = await Auth.requireTenant();
  if (!currentTenant) return;

  let allNotifications = [];
  let currentFilter = 'all';

  // ============================================================================
  // HÀM 1: TẢI DANH SÁCH THÔNG BÁO TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadTenantNotifications
   * Giao diện gọi: Khi trang mở ra hoặc khi bấm #btnReloadNotifications
   * API Backend: GET backend/api/tenant/notifications/list.php
   * Trả về: { success: true, data: [...] }
   * Cập nhật UI: Đổ danh sách thẻ thông báo vào #tenantNotificationsContainer
   */
  async function loadTenantNotifications() {
    const container = document.getElementById('tenantNotificationsContainer');
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải thông báo...
      </div>
    `;

    try {
      const res = await API.get('backend/api/tenant/notifications/list.php');

      if (res.success && Array.isArray(res.data)) {
        allNotifications = res.data;
        renderNotifications();
      } else {
        container.innerHTML = `
          <div class="col-12 text-center py-5 text-danger">
            ${res.message || 'Không thể tải danh sách thông báo.'}
          </div>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải thông báo:', err);
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          Đã có lỗi xảy ra khi kết nối máy chủ.
        </div>
      `;
    }
  }

  // ============================================================================
  // HÀM 2: RENDER DANH SÁCH THẺ THÔNG BÁO THEO BỘ LỌC
  // ============================================================================
  function renderNotifications() {
    const container = document.getElementById('tenantNotificationsContainer');

    let filtered = allNotifications;
    if (currentFilter === 'general') {
      filtered = allNotifications.filter(n => !n.tenant_id);
    } else if (currentFilter === 'personal') {
      filtered = allNotifications.filter(n => !!n.tenant_id);
    }

    if (!filtered || filtered.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm">
          <i class="bi bi-bell-slash fs-2 d-block mb-2 text-secondary"></i>
          Không có thông báo nào trong mục này.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(n => {
      const isGeneral = !n.tenant_id;
      const typeBadge = isGeneral 
        ? '<span class="badge bg-secondary"><i class="bi bi-buildings me-1"></i>Thông báo chung tòa nhà</span>' 
        : '<span class="badge bg-info text-dark"><i class="bi bi-person-fill me-1"></i>Thông báo riêng cho bạn</span>';

      // Nút đánh dấu đã đọc (chỉ dành cho thông báo cá nhân chưa đọc)
      let markReadBtnHtml = '';
      if (!isGeneral) {
        if (n.is_read == 1) {
          markReadBtnHtml = '<span class="badge bg-light text-secondary border"><i class="bi bi-check2-all me-1 text-success"></i>Đã đọc</span>';
        } else {
          markReadBtnHtml = `
            <button class="btn btn-outline-primary btn-sm btn-mark-read" data-id="${n.id}">
              <i class="bi bi-check2"></i> Đánh dấu đã đọc
            </button>
          `;
        }
      }

      return `
        <div class="col-12">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white ${!isGeneral && n.is_read == 0 ? 'border-start border-4 border-primary' : ''}">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
              <div class="d-flex align-items-center gap-2">
                ${typeBadge}
                <span class="small text-muted"><i class="bi bi-clock me-1"></i>${Utils.formatDateTime(n.created_at)}</span>
              </div>
              <div>${markReadBtnHtml}</div>
            </div>

            <h5 class="fw-bold text-dark mb-2">${Utils.escapeHtml(n.title)}</h5>
            <p class="text-secondary mb-0 lh-base" style="white-space: pre-line;">${Utils.escapeHtml(n.message)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================================================
  // SỰ KIỆN: CHUYỂN TAB LỌC THÔNG BÁO
  // ============================================================================
  document.getElementById('notificationFilterTabs').addEventListener('click', function (e) {
    const btn = e.target.closest('.nav-link');
    if (!btn) return;

    document.querySelectorAll('#notificationFilterTabs .nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentFilter = btn.getAttribute('data-filter') || 'all';
    renderNotifications();
  });

  // ============================================================================
  // SỰ KIỆN NÚT 1: ĐÁNH DẤU ĐÃ ĐỌC THÔNG BÁO CÁ NHÂN (.btn-mark-read)
  // ============================================================================
  /**
   * Bắt sự kiện click nút .btn-mark-read
   * Luồng:
   * 1. Lấy notification id từ data-id.
   * 2. Gọi POST backend/api/tenant/notifications/mark_read.php với { id }.
   * 3. Nhận JSON từ backend: cập nhật n.is_read = 1 trong allNotifications và re-render.
   */
  document.getElementById('tenantNotificationsContainer').addEventListener('click', async function (e) {
    const btn = e.target.closest('.btn-mark-read');
    if (!btn) return;

    const notifId = btn.getAttribute('data-id');
    try {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

      const res = await API.post('backend/api/tenant/notifications/mark_read.php', { id: notifId });

      if (res.success) {
        Utils.showToast(res.message || 'Đã đánh dấu thông báo là đã đọc!', 'success');
        const notif = allNotifications.find(n => n.id == notifId);
        if (notif) notif.is_read = 1;
        renderNotifications();
      } else {
        Utils.showToast(res.message || 'Không thể đánh dấu đã đọc', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check2"></i> Đánh dấu đã đọc';
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', err);
      Utils.showToast('Lỗi máy chủ khi cập nhật trạng thái thông báo', 'danger');
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check2"></i> Đánh dấu đã đọc';
    }
  });

  // Tải lại danh sách
  document.getElementById('btnReloadNotifications').addEventListener('click', loadTenantNotifications);

  // Khởi chạy
  loadTenantNotifications();
});

