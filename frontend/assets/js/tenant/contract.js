/**
 * ==============================================================================
 * JAVASCRIPT HỢP ĐỒNG & YÊU CẦU GIA HẠN/TRẢ PHÒNG CỦA CƯ DÂN
 * ==============================================================================
 * File: frontend/assets/js/tenant/contract.js
 * Nhiệm vụ:
 * 1. Xác thực quyền Cư dân (Auth.requireTenant).
 * 2. Gọi GET backend/api/tenant/contract/get.php để tải:
 *    - Điều khoản hợp đồng, phòng, giá thuê, tiền cọc, thời hạn thuê, biên bản bàn giao thiết bị.
 *    - Trạng thái yêu cầu gia hạn/trả phòng hiện tại (extension_status, extension_note).
 * 3. Bắt sự kiện submit form #extensionRequestForm:
 *    - Gửi POST backend/api/tenant/contract/request_extension.php
 *    - Hiển thị Toast thông báo và cập nhật lại hộp thông tin yêu cầu.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực cư dân
  const currentTenant = await Auth.requireTenant();
  if (!currentTenant) return;

  // ============================================================================
  // HÀM 1: TẢI THÔNG TIN HỢP ĐỒNG TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadContractInfo
   * Giao diện gọi: Chạy khi mở trang hoặc sau khi gửi yêu cầu gia hạn/trả phòng
   * API Backend: GET backend/api/tenant/contract/get.php
   * Trả về: { success: true, data: { tenant: {...}, room: {...} } }
   * Cập nhật UI: Đổ dữ liệu vào các thẻ thông số hợp đồng và biên bản bàn giao
   */
  async function loadContractInfo() {
    try {
      const res = await API.get('/tenant/contract/get.php');

      if (res.success && res.data) {
        const tenant = res.data.tenant || res.data || {};
        const room = res.data.room || {
          room_number: tenant.room_number,
          title: tenant.room_title,
          category_name: tenant.room_title,
          location_name: tenant.room_address,
          price: tenant.room_price,
          electricity_rate: tenant.electricity_price,
          water_rate: tenant.water_price
        };

        const roomNumber = room.room_number || tenant.room_number;

        // Hiển thị thông số phòng
        if (roomNumber) {
          document.getElementById('contractRoomNumber').textContent = `Phòng ${roomNumber}`;
          document.getElementById('contractRoomLocation').textContent = room.title || room.category_name || room.location_name || 'CCMN KhánhKaKa';
          document.getElementById('contractRoomPrice').textContent = `${Utils.formatCurrency(room.price || tenant.room_price || 0)} / tháng`;
          document.getElementById('contractElectricityRate').textContent = `${Utils.formatCurrency(room.electricity_rate || tenant.electricity_price || 3800)} / kWh`;
          document.getElementById('contractWaterRate').textContent = `${Utils.formatCurrency(room.water_rate || tenant.water_price || 30000)} / m³`;
        } else {
          document.getElementById('contractRoomNumber').textContent = 'Chưa xếp phòng';
          document.getElementById('contractRoomLocation').textContent = 'Liên hệ BQL';
          document.getElementById('contractRoomPrice').textContent = '0 đ';
        }

        const startDate = tenant.contract_start || tenant.start_date;
        const endDate = tenant.contract_end || tenant.end_date;

        document.getElementById('contractDeposit').textContent = `Tiền cọc: ${Utils.formatCurrency(tenant.deposit_amount || 0)}`;
        document.getElementById('contractStartDate').textContent = startDate ? Utils.formatDate(startDate) : 'Chưa xác định';
        document.getElementById('contractEndDate').textContent = endDate ? Utils.formatDate(endDate) : 'Không thời hạn';

        // Trạng thái hợp đồng: 'active' trong database hoặc 'renting'
        const statusBadge = document.getElementById('contractStatusBadge');
        if (tenant.status === 'active' || tenant.status === 'renting') {
          statusBadge.className = 'badge bg-success fs-6 px-3 py-2';
          statusBadge.textContent = 'Hợp đồng đang hiệu lực';
        } else {
          statusBadge.className = 'badge bg-secondary fs-6 px-3 py-2';
          statusBadge.textContent = 'Hợp đồng đã kết thúc';
        }

        // Biên bản bàn giao tài sản (contract_notes)
        const notesContainer = document.getElementById('contractNotesContainer');
        if (tenant.contract_notes) {
          notesContainer.innerHTML = tenant.contract_notes.replace(/\n/g, '<br>');
        } else {
          notesContainer.innerHTML = '<span class="text-muted italic">Biên bản bàn giao thiết bị được lưu giữ tại văn phòng BQL tòa nhà.</span>';
        }

        // Kiểm tra yêu cầu gia hạn / trả phòng hiện tại
        renderCurrentExtensionStatus(tenant);
      } else {
        Utils.showToast(res.message || 'Không thể tải thông tin hợp đồng', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin hợp đồng:', err);
      Utils.showToast('Lỗi máy chủ khi tải hợp đồng', 'danger');
    }
  }

  // ============================================================================
  // HÀM 2: RENDER HỘP THÔNG BÁO YÊU CẦU GIA HẠN / TRẢ PHÒNG ĐÃ GỬI
  // ============================================================================
  function renderCurrentExtensionStatus(tenant) {
    const box = document.getElementById('currentExtensionBox');
    if (!box) return;

    if (tenant.extension_status && tenant.extension_status !== 'none') {
      box.classList.remove('d-none');
      let statusTitle = '';
      let badgeClass = 'bg-primary';

      if (tenant.extension_status === 'requested_extension') {
        statusTitle = 'Bạn đã gửi yêu cầu GIA HẠN HỢP ĐỒNG';
        badgeClass = 'bg-primary';
      } else if (tenant.extension_status === 'requested_leave') {
        statusTitle = 'Bạn đã gửi thông báo XIN TRẢ PHÒNG';
        badgeClass = 'bg-danger';
      }

      box.innerHTML = `
        <div class="alert alert-info border-0 rounded-3 shadow-sm p-3">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="badge ${badgeClass}">${statusTitle}</span>
            <span class="small text-muted">Đang chờ BQL xét duyệt</span>
          </div>
          <div class="small text-dark">
            <strong>Nội dung đã gửi:</strong> ${Utils.escapeHtml(tenant.extension_note || 'Không có ghi chú')}
          </div>
        </div>
      `;
    } else {
      box.classList.add('d-none');
    }
  }

  // ============================================================================
  // SỰ KIỆN FORM 3: SUBMIT YÊU CẦU GIA HẠN / TRẢ PHÒNG (#extensionRequestForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #extensionRequestForm
   * Luồng:
   * 1. Thu thập extension_status và extension_note.
   * 2. Gọi POST backend/api/tenant/contract/request_extension.php.
   * 3. Nhận phản hồi JSON: hiển thị Toast và tải lại hợp đồng để cập nhật trạng thái.
   */
  document.getElementById('extensionRequestForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btnSubmitExtension');
    const originalBtnHtml = submitBtn.innerHTML;

    const payload = {
      extension_status: document.getElementById('extensionType').value,
      extension_note: document.getElementById('extensionNote').value.trim()
    };

    if (!payload.extension_note) {
      Utils.showToast('Vui lòng nhập lý do và thời gian cụ thể!', 'warning');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang gửi yêu cầu...';

      const res = await API.post('backend/api/tenant/contract/request_extension.php', payload);

      if (res.success) {
        Utils.showToast(res.message || 'Gửi yêu cầu tới Ban Quản Lý thành công!', 'success');
        document.getElementById('extensionNote').value = '';
        loadContractInfo();
      } else {
        Utils.showToast(res.message || 'Không thể gửi yêu cầu', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu gia hạn/trả phòng:', err);
      Utils.showToast('Lỗi máy chủ khi gửi yêu cầu', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });

  // Tải thông tin hợp đồng ban đầu
  loadContractInfo();
});

