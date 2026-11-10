/**
 * ==============================================================================
 * JAVASCRIPT BÁO HỎNG & SỬA CHỮA CỦA CƯ DÂN (TENANT MAINTENANCE)
 * ==============================================================================
 * File: frontend/assets/js/tenant/maintenance.js
 * Nhiệm vụ:
 * 1. Kiểm tra xác thực Cư dân (Auth.requireTenant).
 * 2. Tải danh sách phiếu báo hỏng: GET backend/api/tenant/maintenance/list.php.
 * 3. Bắt sự kiện mở modal #maintenanceModal (#btnOpenMaintenanceModal).
 * 4. Bắt sự kiện submit form #maintenanceForm:
 *    - Gửi POST backend/api/tenant/maintenance/create.php
 *    - Nhận JSON: thông báo thành công, đóng modal và tải lại bảng.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực cư dân
  const currentTenant = await Auth.requireTenant();
  if (!currentTenant) return;

  const modalEl = document.getElementById('maintenanceModal');
  const maintenanceModal = new bootstrap.Modal(modalEl);

  // ============================================================================
  // HÀM 1: TẢI DANH SÁCH YÊU CẦU SỬA CHỮA TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadTenantMaintenance
   * Giao diện gọi: Khi trang mở ra hoặc khi bấm nút tải lại #btnReloadMaintenance
   * API Backend: GET backend/api/tenant/maintenance/list.php
   * Trả về: { success: true, data: [...] }
   * Cập nhật UI: Đổ các hàng vào #tenantMaintenanceTableBody
   */
  async function loadTenantMaintenance() {
    const tbody = document.getElementById('tenantMaintenanceTableBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải danh sách yêu cầu...
        </td>
      </tr>
    `;

    try {
      const res = await API.get('backend/api/tenant/maintenance/list.php');

      if (res.success && Array.isArray(res.data)) {
        renderMaintenanceTable(res.data);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-4 text-danger">
              ${res.message || 'Không thể tải danh sách yêu cầu sửa chữa.'}
            </td>
          </tr>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách sửa chữa:', err);
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
  // HÀM 2: RENDER BẢNG BÁO HỎNG CỦA CƯ DÂN
  // ============================================================================
  function renderMaintenanceTable(list) {
    const tbody = document.getElementById('tenantMaintenanceTableBody');
    if (!list || list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            Bạn chưa gửi yêu cầu sửa chữa thiết bị nào. 
            Nếu phòng có sự cố điện nước, hãy bấm nút "Báo hỏng thiết bị mới" phía trên!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(m => {
      let statusBadge = '';
      if (m.status === 'pending') {
        statusBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Chờ tiếp nhận</span>';
      } else if (m.status === 'processing') {
        statusBadge = '<span class="badge bg-primary"><i class="bi bi-wrench me-1"></i>Đang xử lý</span>';
      } else if (m.status === 'completed') {
        statusBadge = '<span class="badge bg-success"><i class="bi bi-check2-all me-1"></i>Đã sửa xong</span>';
      } else {
        statusBadge = '<span class="badge bg-secondary"><i class="bi bi-x-circle me-1"></i>Đã hủy</span>';
      }

      return `
        <tr>
          <td class="text-muted fw-bold">#${m.id}</td>
          <td class="fw-bold text-dark">${Utils.escapeHtml(m.title)}</td>
          <td class="small text-secondary" style="max-width: 300px;">${Utils.escapeHtml(m.description)}</td>
          <td class="small text-muted">${Utils.formatDateTime(m.created_at)}</td>
          <td>${statusBadge}</td>
          <td class="small text-dark">
            ${m.admin_notes ? `<div class="text-info">${Utils.escapeHtml(m.admin_notes)}</div>` : '<span class="text-muted small">Chưa có phản hồi</span>'}
            ${m.cost && m.cost > 0 ? `<div class="text-danger fw-semibold">Chi phí: ${Utils.formatCurrency(m.cost)}</div>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // SỰ KIỆN NÚT 1: MỞ MODAL BÁO HỎNG MỚI (#btnOpenMaintenanceModal)
  // ============================================================================
  document.getElementById('btnOpenMaintenanceModal').addEventListener('click', function () {
    document.getElementById('maintenanceForm').reset();
    maintenanceModal.show();
  });

  // ============================================================================
  // SỰ KIỆN FORM 2: SUBMIT BÁO HỎNG THIẾT BỊ (#maintenanceForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #maintenanceForm
   * Luồng:
   * 1. Lấy title, description.
   * 2. Gọi POST backend/api/tenant/maintenance/create.php.
   * 3. Phía backend gán room_id và tenant_id từ phiên làm việc của cư dân.
   * 4. Nhận JSON: hiển thị Toast thành công, đóng modal và tải lại bảng.
   */
  document.getElementById('maintenanceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btnSubmitMaintenance');
    const originalBtnHtml = submitBtn.innerHTML;

    const payload = {
      title: document.getElementById('maintenanceTitle').value.trim(),
      description: document.getElementById('maintenanceDescription').value.trim()
    };

    if (!payload.title || !payload.description) {
      Utils.showToast('Vui lòng điền đầy đủ tiêu đề và mô tả sự cố!', 'warning');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang gửi phiếu...';

      const res = await API.post('backend/api/tenant/maintenance/create.php', payload);

      if (res.success) {
        Utils.showToast(
          res.message || 'Gửi yêu cầu sửa chữa thành công! Đội kỹ thuật tòa nhà sẽ liên hệ với bạn.',
          'success'
        );
        maintenanceModal.hide();
        loadTenantMaintenance();
      } else {
        Utils.showToast(res.message || 'Không thể gửi yêu cầu sửa chữa', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu sửa chữa:', err);
      Utils.showToast('Lỗi máy chủ khi gửi phiếu yêu cầu', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });

  // Tải lại danh sách
  document.getElementById('btnReloadMaintenance').addEventListener('click', loadTenantMaintenance);

  // Khởi chạy
  loadTenantMaintenance();
});

