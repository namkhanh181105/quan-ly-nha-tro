/**
 * ==============================================================================
 * JAVASCRIPT HÓA ĐƠN & TẢI MINH CHỨNG THANH TOÁN (TENANT INVOICES & PROOF)
 * ==============================================================================
 * File: frontend/assets/js/tenant/invoices.js
 * Nhiệm vụ:
 * 1. Kiểm tra xác thực Cư dân (Auth.requireTenant).
 * 2. Tải lịch sử hóa đơn của cư dân: GET backend/api/tenant/invoices/list.php.
 * 3. Render bảng hóa đơn kèm huy hiệu trạng thái & trạng thái minh chứng.
 * 4. Bắt sự kiện xem chi tiết hóa đơn (.btn-view-invoice):
 *    - Gọi GET backend/api/tenant/invoices/detail.php?id=...
 *    - Mở modal #invoiceDetailModal hiển thị bảng bóc tách chỉ số điện, nước.
 * 5. Bắt sự kiện nộp minh chứng chuyển khoản (.btn-upload-proof):
 *    - Mở modal #uploadProofModal.
 *    - Xem trước ảnh biên lai khi người dùng chọn file.
 *    - Bắt sự kiện submit form #uploadProofForm => POST backend/api/tenant/invoices/upload_proof.php.
 *    - Sau khi thành công: Cập nhật danh sách hóa đơn (trạng thái minh chứng chuyển thành 'pending' chờ BQL duyệt).
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực cư dân
  const currentTenant = await Auth.requireTenant();
  if (!currentTenant) return;

  // Khởi tạo các Modal Bootstrap
  const proofModalEl = document.getElementById('uploadProofModal');
  const uploadProofModal = new bootstrap.Modal(proofModalEl);

  const detailModalEl = document.getElementById('invoiceDetailModal');
  const invoiceDetailModal = new bootstrap.Modal(detailModalEl);

  let invoicesCache = [];

  // ============================================================================
  // HÀM 1: TẢI DANH SÁCH HÓA ĐƠN CỦA CƯ DÂN TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadTenantInvoices
   * Giao diện gọi: Khi trang mở ra hoặc khi bấm #btnReloadInvoices
   * API Backend: GET backend/api/tenant/invoices/list.php
   * Trả về: { success: true, data: [...] }
   * Cập nhật UI: Render các hàng <tr> vào #tenantInvoicesTableBody
   */
  async function loadTenantInvoices() {
    const tbody = document.getElementById('tenantInvoicesTableBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải lịch sử hóa đơn...
        </td>
      </tr>
    `;

    try {
      const res = await API.get('backend/api/tenant/invoices/list.php');

      if (res.success && Array.isArray(res.data)) {
        invoicesCache = res.data;
        renderInvoicesTable(invoicesCache);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" class="text-center py-4 text-danger">
              ${res.message || 'Không thể tải danh sách hóa đơn.'}
            </td>
          </tr>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải hóa đơn cư dân:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-4 text-danger">
            Đã có lỗi xảy ra khi kết nối máy chủ.
          </td>
        </tr>
      `;
    }
  }

  // ============================================================================
  // HÀM 2: RENDER BẢNG HÓA ĐƠN CƯ DÂN
  // ============================================================================
  function renderInvoicesTable(invoices) {
    const tbody = document.getElementById('tenantInvoicesTableBody');
    if (!invoices || invoices.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-4 text-muted">
            Bạn hiện chưa có hóa đơn nào được tạo trong hệ thống.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = invoices.map(inv => {
      const statusBadge = Utils.getInvoiceStatusBadge(inv.status);
      const proofBadge = Utils.getProofStatusBadge(inv.payment_proof_status);

      const electricWater = (inv.electricity_cost || 0) + (inv.water_cost || 0);
      const debt = inv.debt_amount !== undefined ? inv.debt_amount : (inv.total_amount - (inv.paid_amount || 0));

      // Nút nộp minh chứng chỉ khả dụng nếu chưa trả xong
      const canUploadProof = inv.status !== 'paid';
      const uploadBtnHtml = canUploadProof ? `
        <button class="btn btn-outline-primary btn-sm btn-upload-proof" data-id="${inv.id}" title="Nộp ảnh chuyển khoản">
          <i class="bi bi-cloud-arrow-up"></i> Nộp bill
        </button>
      ` : '';

      // Link xem minh chứng đã nộp (nếu có)
      let viewProofHtml = '';
      if (inv.payment_proof) {
        viewProofHtml = `
          <div class="mt-1">
            <a href="${APP_CONFIG.BASE_URL}/backend/api/storage/view_proof.php?file=${encodeURIComponent(inv.payment_proof)}" 
               target="_blank" class="small text-decoration-none" title="Xem ảnh biên lai đã gửi">
              <i class="bi bi-image me-1"></i>Xem biên lai
            </a>
          </div>
        `;
      }

      return `
        <tr>
          <td class="text-muted fw-bold">#${inv.id}</td>
          <td>
            <div class="fw-bold text-dark">Tháng ${inv.month}/${inv.year}</div>
            <div class="small text-muted font-monospace">P.${Utils.escapeHtml(inv.room_number || '')}</div>
          </td>
          <td>${Utils.formatCurrency(inv.room_price || 0)}</td>
          <td>
            <span class="small">${Utils.formatCurrency(electricWater)}</span>
          </td>
          <td>${Utils.formatCurrency(inv.service_cost || 0)}</td>
          <td class="fw-bold text-danger">${Utils.formatCurrency(inv.total_amount)}</td>
          <td>
            <div class="small text-success">Đã trả: ${Utils.formatCurrency(inv.paid_amount || 0)}</div>
            ${debt > 0 ? `<div class="small text-danger fw-bold">Còn thiếu: ${Utils.formatCurrency(debt)}</div>` : ''}
          </td>
          <td>${statusBadge}</td>
          <td>
            ${proofBadge}
            ${viewProofHtml}
          </td>
          <td class="text-center">
            <div class="d-flex justify-content-center gap-1">
              <!-- NÚT: Xem chi tiết hóa đơn (btn-view-invoice) -->
              <button class="btn btn-outline-secondary btn-sm btn-view-invoice" data-id="${inv.id}" title="Xem chi tiết tính tiền">
                <i class="bi bi-eye"></i>
              </button>
              ${uploadBtnHtml}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // SỰ KIỆN NÚT 1: XEM CHI TIẾT HÓA ĐƠN (.btn-view-invoice)
  // ============================================================================
  /**
   * Bắt sự kiện click nút .btn-view-invoice
   * Luồng:
   * 1. Lấy invoice_id từ data-id.
   * 2. Gọi GET backend/api/tenant/invoices/detail.php?id=...
   * 3. Điền thông tin chỉ số điện nước, đơn giá, tổng thành tiền vào modal và show.
   */
  document.getElementById('tenantInvoicesTableBody').addEventListener('click', async function (e) {
    const btn = e.target.closest('.btn-view-invoice');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    const modalBody = document.getElementById('invDetailModalBody');
    document.getElementById('invDetailModalTitle').textContent = `Chi tiết hóa đơn #${id}`;
    modalBody.innerHTML = '<div class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm me-2"></div> Đang tải chi tiết hóa đơn...</div>';
    invoiceDetailModal.show();

    try {
      const res = await API.get('backend/api/tenant/invoices/detail.php', { id: id });
      if (res.success && res.data) {
        const inv = res.data;
        const electricUsage = (inv.electricity_end || 0) - (inv.electricity_start || 0);
        const waterUsage = (inv.water_end || 0) - (inv.water_start || 0);

        modalBody.innerHTML = `
          <div class="row g-3 mb-4">
            <div class="col-sm-6">
              <div class="p-3 bg-light rounded-3">
                <div class="text-muted small">Phòng &amp; Kỳ thanh toán</div>
                <div class="fw-bold fs-5 text-dark">Phòng ${Utils.escapeHtml(inv.room_number || '')} - Tháng ${inv.month}/${inv.year}</div>
                <div class="small text-muted">Ngày tạo: ${Utils.formatDate(inv.created_at)}</div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="p-3 bg-light rounded-3">
                <div class="text-muted small">Trạng thái thanh toán</div>
                <div class="mt-1">${Utils.getInvoiceStatusBadge(inv.status)} ${Utils.getProofStatusBadge(inv.payment_proof_status)}</div>
                <div class="small text-muted mt-1">Đã trả: ${Utils.formatCurrency(inv.paid_amount || 0)} | Còn nợ: ${Utils.formatCurrency(inv.debt_amount || 0)}</div>
              </div>
            </div>
          </div>

          <table class="table table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th>Khoản mục</th>
                <th>Chỉ số đầu - cuối</th>
                <th>Sử dụng</th>
                <th>Đơn giá</th>
                <th class="text-end">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Tiền thuê phòng</strong></td>
                <td colspan="3" class="text-muted small">Cố định theo hợp đồng</td>
                <td class="text-end fw-bold">${Utils.formatCurrency(inv.room_price || 0)}</td>
              </tr>
              <tr>
                <td><strong>Tiền điện</strong></td>
                <td>${inv.electricity_start || 0} &rarr; ${inv.electricity_end || 0}</td>
                <td>${electricUsage > 0 ? electricUsage : 0} kWh</td>
                <td>${Utils.formatCurrency(inv.electricity_rate || 0)} / kWh</td>
                <td class="text-end fw-bold">${Utils.formatCurrency(inv.electricity_cost || 0)}</td>
              </tr>
              <tr>
                <td><strong>Tiền nước sinh hoạt</strong></td>
                <td>${inv.water_start || 0} &rarr; ${inv.water_end || 0}</td>
                <td>${waterUsage > 0 ? waterUsage : 0} m³</td>
                <td>${Utils.formatCurrency(inv.water_rate || 0)} / m³</td>
                <td class="text-end fw-bold">${Utils.formatCurrency(inv.water_cost || 0)}</td>
              </tr>
              <tr>
                <td><strong>Dịch vụ khác</strong> (Vệ sinh, wifi, rác, thang máy)</td>
                <td colspan="3" class="text-muted small">Quy định tòa nhà</td>
                <td class="text-end fw-bold">${Utils.formatCurrency(inv.service_cost || 0)}</td>
              </tr>
              <tr class="table-light fs-5">
                <td colspan="4" class="text-end fw-bold">TỔNG CỘNG HÓA ĐƠN:</td>
                <td class="text-end fw-bold text-danger">${Utils.formatCurrency(inv.total_amount)}</td>
              </tr>
            </tbody>
          </table>
        `;
      } else {
        modalBody.innerHTML = `<div class="text-center py-4 text-danger">${res.message || 'Không thể tải chi tiết hóa đơn.'}</div>`;
      }
    } catch (err) {
      console.error('Lỗi khi xem chi tiết hóa đơn:', err);
      modalBody.innerHTML = '<div class="text-center py-4 text-danger">Lỗi máy chủ khi tải chi tiết hóa đơn.</div>';
    }
  });

  // ============================================================================
  // SỰ KIỆN NÚT 2: MỞ MODAL NỘP BIÊN LAI CHUYỂN KHOẢN (.btn-upload-proof)
  // ============================================================================
  document.getElementById('tenantInvoicesTableBody').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-upload-proof');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    const inv = invoicesCache.find(i => i.id == id);
    if (!inv) return;

    document.getElementById('uploadProofForm').reset();
    document.getElementById('proofInvoiceId').value = inv.id;
    document.getElementById('proofPreviewBox').classList.add('d-none');
    document.getElementById('proofPreviewImg').src = '';

    const debt = inv.debt_amount !== undefined ? inv.debt_amount : (inv.total_amount - (inv.paid_amount || 0));
    document.getElementById('proofInvoiceSummary').innerHTML = `
      <strong>Hóa đơn tháng ${inv.month}/${inv.year}</strong> (Phòng ${Utils.escapeHtml(inv.room_number || '')})<br>
      Tổng tiền: <strong>${Utils.formatCurrency(inv.total_amount)}</strong> | Số tiền cần thanh toán: <strong class="text-danger">${Utils.formatCurrency(debt)}</strong>
    `;

    uploadProofModal.show();
  });

  // ============================================================================
  // SỰ KIỆN: XEM TRƯỚC ẢNH MINH CHỨNG KHI CHỌN FILE
  // ============================================================================
  document.getElementById('proofFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        document.getElementById('proofPreviewImg').src = evt.target.result;
        document.getElementById('proofPreviewBox').classList.remove('d-none');
      };
      reader.readAsDataURL(file);
    }
  });

  // ============================================================================
  // SỰ KIỆN FORM 3: SUBMIT TẢI LÊN BIÊN LAI (#uploadProofForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #uploadProofForm
   * Luồng:
   * 1. Kiểm tra file minh chứng đã chọn.
   * 2. Đóng gói FormData (id, payment_proof file).
   * 3. Gửi POST backend/api/tenant/invoices/upload_proof.php.
   * 4. Nhận phản hồi JSON:
   *    - Backend lưu ảnh an toàn vào storage/payment_proofs/, cập nhật invoices.payment_proof_status = 'pending'.
   *    - Hiển thị Toast thông báo thành công, đóng modal, tải lại bảng hóa đơn.
   */
  document.getElementById('uploadProofForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btnSubmitProof');
    const originalBtnHtml = submitBtn.innerHTML;

    const invoiceId = document.getElementById('proofInvoiceId').value;
    const fileInput = document.getElementById('proofFile');

    if (!fileInput.files || fileInput.files.length === 0) {
      Utils.showToast('Vui lòng chọn ảnh chụp màn hình biên lai chuyển khoản!', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('id', invoiceId);
    formData.append('payment_proof', fileInput.files[0]);

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang tải lên...';

      const res = await API.post('backend/api/tenant/invoices/upload_proof.php', formData);

      if (res.success) {
        Utils.showToast(
          res.message || 'Tải minh chứng chuyển khoản thành công! Ban Quản Lý sẽ sớm kiểm tra và xác nhận hóa đơn.',
          'success'
        );
        uploadProofModal.hide();
        loadTenantInvoices();
      } else {
        Utils.showToast(res.message || 'Không thể tải lên minh chứng', 'danger');
      }
    } catch (err) {
      console.error('Lỗi tải minh chứng:', err);
      Utils.showToast('Lỗi máy chủ khi tải ảnh minh chứng', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });

  // Tải lại danh sách
  document.getElementById('btnReloadInvoices').addEventListener('click', loadTenantInvoices);

  // Khởi chạy
  loadTenantInvoices();
});

