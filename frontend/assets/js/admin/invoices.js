/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ HÓA ĐƠN & THU TIỀN (ADMIN INVOICES JS)
 * ============================================================================
 * - Nạp danh sách & lọc: GET backend/api/admin/invoices/list.php
 * - Lập hóa đơn mới: POST backend/api/admin/invoices/create.php
 * - Ghi nhận thanh toán: POST backend/api/admin/invoices/record_payment.php
 * - Đối soát duyệt bill: POST backend/api/admin/invoices/review_proof.php
 * - Xóa hóa đơn: POST backend/api/admin/invoices/delete.php
 * - Tính toán trực tiếp số tiền điện, nước, tổng tiền và nợ tồn khi người dùng nhập số.
 */

let currentPage = 1;
let currentFilters = {};
let invoiceModal = null;
let paymentModal = null;
let reviewProofModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Quản Lý Hóa Đơn & Thu Tiền';

  invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
  paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
  reviewProofModal = new bootstrap.Modal(document.getElementById('reviewProofModal'));

  await loadRoomsDropdown();
  await loadInvoices(1);
  initEventListeners();
});

async function loadRoomsDropdown() {
  try {
    const res = await API.get('/admin/rooms/list.php', { limit: 50 });
    if (res && res.success && res.data) {
      const select = document.getElementById('invRoomId');
      select.innerHTML = '<option value="">-- Chọn phòng --</option>';
      res.data.items.forEach(r => {
        select.innerHTML += `<option value="${r.id}" data-price="${r.price}" data-elec="${r.electricity_price}" data-water="${r.water_price}">Phòng ${CONFIG.escapeHtml(r.room_number)} (Giá: ${CONFIG.formatCurrency(r.price)})</option>`;
      });
    }
  } catch (e) {
    console.error('Lỗi nạp dropdown phòng:', e);
  }
}

async function loadInvoices(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('invoicesTableBody');
  tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang nạp danh sách hóa đơn...</td></tr>';

  try {
    const params = {
      page: currentPage,
      limit: 10,
      ...currentFilters
    };

    const res = await API.get('/admin/invoices/list.php', params);
    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderInvoicesTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4 text-danger">${res.message || 'Lỗi tải danh sách.'}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-danger">Lỗi kết nối máy chủ khi nạp hóa đơn.</td></tr>';
  }
}

function renderInvoicesTable(invoices) {
  const tbody = document.getElementById('invoicesTableBody');
  if (!invoices || invoices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center py-4 text-muted">Không tìm thấy hóa đơn nào phù hợp.</td></tr>';
    return;
  }

  let html = '';
  invoices.forEach(inv => {
    const hasProof = Boolean(inv.payment_proof);
    const isPendingProof = (inv.payment_proof_status === 'pending');

    html += `
      <tr>
        <td>
          <strong>${CONFIG.escapeHtml(inv.invoice_code)}</strong>
          <div class="small text-muted">${CONFIG.formatDate(inv.created_at)}</div>
        </td>
        <td>
          <span class="badge bg-dark fw-bold">P.${CONFIG.escapeHtml(inv.room_number)}</span>
          <div class="small text-muted">${CONFIG.escapeHtml(inv.tenant_name || 'Khách vãng lai')}</div>
        </td>
        <td><span class="badge bg-light text-dark border">Tháng ${inv.month}/${inv.year}</span></td>
        <td class="small">
          <div>${inv.old_electricity} &rarr; ${inv.new_electricity}</div>
          <strong class="text-warning">${inv.electricity_usage} số</strong>
        </td>
        <td class="small">
          <div>${inv.old_water} &rarr; ${inv.new_water}</div>
          <strong class="text-info">${inv.water_usage} khối</strong>
        </td>
        <td><strong class="text-danger">${CONFIG.formatCurrency(inv.total_amount)}</strong></td>
        <td><span class="text-success">${CONFIG.formatCurrency(inv.paid_amount)}</span></td>
        <td>
          <span class="fw-bold ${Number(inv.debt_amount) > 0 ? 'text-danger' : 'text-muted'}">
            ${CONFIG.formatCurrency(inv.debt_amount)}
          </span>
        </td>
        <td>${CONFIG.getStatusBadge('invoice', inv.payment_status)}</td>
        <td>
          ${CONFIG.getStatusBadge('proof', inv.payment_proof_status)}
          ${hasProof ? `
            <div class="mt-1">
              <button class="btn ${isPendingProof ? 'btn-warning fw-bold' : 'btn-outline-info'} btn-sm p-1 py-0 fs-7 btn-view-proof" data-id="${inv.id}" data-file="${encodeURIComponent(inv.payment_proof)}" data-status="${inv.payment_proof_status}" data-debt="${inv.debt_amount}">
                <i class="bi bi-image me-1"></i> ${isPendingProof ? 'Duyệt bill' : 'Xem bill'}
              </button>
            </div>
          ` : ''}
        </td>
        <td class="text-center">
          <div class="dropdown">
            <button class="btn btn-light btn-sm border dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Thao tác
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li>
                <a class="dropdown-item btn-record-pay" href="#" data-id="${inv.id}" data-code="${CONFIG.escapeHtml(inv.invoice_code)}" data-total="${inv.total_amount}" data-paid="${inv.paid_amount}" data-debt="${inv.debt_amount}">
                  <i class="bi bi-cash me-2 text-success"></i> Ghi nhận đã thu
                </a>
              </li>
              ${inv.payment_status !== 'paid' ? `
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger btn-delete-invoice" href="#" data-id="${inv.id}" data-code="${CONFIG.escapeHtml(inv.invoice_code)}">
                    <i class="bi bi-trash me-2"></i> Xóa hóa đơn
                  </a>
                </li>
              ` : ''}
            </ul>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  bindTableEvents();
}

function bindTableEvents() {
  document.querySelectorAll('.btn-record-pay').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      openPaymentModal({
        id: b.getAttribute('data-id'),
        code: b.getAttribute('data-code'),
        total: b.getAttribute('data-total'),
        paid: b.getAttribute('data-paid'),
        debt: b.getAttribute('data-debt')
      });
    });
  });

  document.querySelectorAll('.btn-view-proof').forEach(b => {
    b.addEventListener('click', () => {
      openReviewProofModal({
        id: b.getAttribute('data-id'),
        file: b.getAttribute('data-file'),
        status: b.getAttribute('data-status'),
        debt: b.getAttribute('data-debt')
      });
    });
  });

  document.querySelectorAll('.btn-delete-invoice').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      handleDeleteInvoice(b.getAttribute('data-id'), b.getAttribute('data-code'));
    });
  });
}

function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;
  const { page, total, total_pages } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} hóa đơn)`;

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
      if (p && p !== currentPage) loadInvoices(p);
    });
  });
}

function initEventListeners() {
  document.getElementById('invoiceFilterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFilters = {
      keyword: document.getElementById('filterKeyword').value.trim(),
      month: document.getElementById('filterMonth').value,
      year: document.getElementById('filterYear').value,
      payment_status: document.getElementById('filterPaymentStatus').value,
      payment_proof_status: document.getElementById('filterProofStatus').value
    };
    loadInvoices(1);
  });

  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('invoiceFilterForm').reset();
    currentFilters = {};
    loadInvoices(1);
  });

  document.getElementById('btnAddInvoice').addEventListener('click', () => {
    document.getElementById('invoiceForm').reset();
    document.getElementById('invMonth').value = new Date().getMonth() + 1;
    document.getElementById('invYear').value = new Date().getFullYear();
    document.getElementById('invServiceAmount').value = '150000';
    document.getElementById('invOtherAmount').value = '0';
    document.getElementById('invPaidAmount').value = '0';
    calculateLivePreview();
    invoiceModal.show();
  });

  // Tự động điền giá phòng khi chọn phòng
  document.getElementById('invRoomId').addEventListener('change', (e) => {
    const selected = e.target.options[e.target.selectedIndex];
    if (selected && selected.value) {
      document.getElementById('invRoomPrice').value = selected.getAttribute('data-price') || 0;
      document.getElementById('invElecRate').value = selected.getAttribute('data-elec') || 3800;
      document.getElementById('invWaterRate').value = selected.getAttribute('data-water') || 30000;
      calculateLivePreview();
    }
  });

  // Tự động tính toán khi thay đổi chỉ số điện, nước, tiền phòng
  ['invRoomPrice', 'invOldElec', 'invNewElec', 'invElecRate', 'invOldWater', 'invNewWater', 'invWaterRate', 'invServiceAmount', 'invOtherAmount', 'invPaidAmount'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateLivePreview);
  });

  // Submit form tạo hóa đơn
  document.getElementById('invoiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCreateInvoice();
  });

  // Submit form thanh toán
  document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSavePayment();
  });
}

/**
 * Tính toán trực quan tức thì trên Modal
 */
function calculateLivePreview() {
  const roomPrice = parseFloat(document.getElementById('invRoomPrice').value) || 0;
  const oldElec = parseInt(document.getElementById('invOldElec').value) || 0;
  const newElec = parseInt(document.getElementById('invNewElec').value) || 0;
  const elecRate = parseFloat(document.getElementById('invElecRate').value) || 3800;

  const oldWater = parseInt(document.getElementById('invOldWater').value) || 0;
  const newWater = parseInt(document.getElementById('invNewWater').value) || 0;
  const waterRate = parseFloat(document.getElementById('invWaterRate').value) || 30000;

  const service = parseFloat(document.getElementById('invServiceAmount').value) || 0;
  const other = parseFloat(document.getElementById('invOtherAmount').value) || 0;
  const paid = parseFloat(document.getElementById('invPaidAmount').value) || 0;

  const elecUsage = Math.max(0, newElec - oldElec);
  const elecAmount = elecUsage * elecRate;
  document.getElementById('previewElecAmount').value = CONFIG.formatCurrency(elecAmount);

  const waterUsage = Math.max(0, newWater - oldWater);
  const waterAmount = waterUsage * waterRate;
  document.getElementById('previewWaterAmount').value = CONFIG.formatCurrency(waterAmount);

  const total = roomPrice + elecAmount + waterAmount + service + other;
  const debt = Math.max(0, total - paid);

  document.getElementById('previewTotalAmount').textContent = CONFIG.formatCurrency(total);
  document.getElementById('previewDebtAmount').textContent = CONFIG.formatCurrency(debt);
}

async function handleCreateInvoice() {
  const btnSave = document.getElementById('btnSaveInvoice');
  const payload = {
    room_id: parseInt(document.getElementById('invRoomId').value),
    month: parseInt(document.getElementById('invMonth').value),
    year: parseInt(document.getElementById('invYear').value),
    room_price: parseFloat(document.getElementById('invRoomPrice').value),
    old_electricity: parseInt(document.getElementById('invOldElec').value) || 0,
    new_electricity: parseInt(document.getElementById('invNewElec').value) || 0,
    electricity_rate: parseFloat(document.getElementById('invElecRate').value),
    old_water: parseInt(document.getElementById('invOldWater').value) || 0,
    new_water: parseInt(document.getElementById('invNewWater').value) || 0,
    water_rate: parseFloat(document.getElementById('invWaterRate').value),
    service_amount: parseFloat(document.getElementById('invServiceAmount').value) || 0,
    other_amount: parseFloat(document.getElementById('invOtherAmount').value) || 0,
    paid_amount: parseFloat(document.getElementById('invPaidAmount').value) || 0,
    note: document.getElementById('invNote').value.trim()
  };

  try {
    const res = await API.post('/admin/invoices/create.php', payload, { buttonToDisable: btnSave });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Lập hóa đơn thành công!', 'success');
      invoiceModal.hide();
      await loadInvoices(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể lập hóa đơn.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi lập hóa đơn.', 'error');
  }
}

function openPaymentModal(data) {
  document.getElementById('payInvoiceId').value = data.id;
  document.getElementById('payAmount').value = data.debt;
  document.getElementById('payDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('payInvoiceSummary').innerHTML = `
    <strong>Mã hóa đơn:</strong> ${CONFIG.escapeHtml(data.code)}<br>
    <strong>Tổng tiền:</strong> ${CONFIG.formatCurrency(data.total)} | 
    <strong>Đã nộp:</strong> ${CONFIG.formatCurrency(data.paid)} | 
    <strong class="text-danger">Còn thiếu:</strong> ${CONFIG.formatCurrency(data.debt)}
  `;
  document.getElementById('paymentModalTitle').textContent = `Thu tiền hóa đơn ${data.code}`;
  paymentModal.show();
}

async function handleSavePayment() {
  const btnSave = document.getElementById('btnSavePayment');
  const id = document.getElementById('payInvoiceId').value;
  const amount = parseFloat(document.getElementById('payAmount').value) || 0;
  const paymentDate = document.getElementById('payDate').value;
  const note = document.getElementById('payNote').value.trim();

  try {
    const res = await API.post('/admin/invoices/record_payment.php', {
      id: parseInt(id),
      amount,
      payment_date: paymentDate,
      note
    }, { buttonToDisable: btnSave });

    if (res && res.success) {
      CONFIG.showToast(res.message || 'Ghi nhận thanh toán thành công!', 'success');
      paymentModal.hide();
      await loadInvoices(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Lỗi khi ghi nhận thanh toán.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ khi lưu thanh toán.', 'error');
  }
}

async function openReviewProofModal(data) {
  document.getElementById('proofInvoiceId').value = data.id;
  document.getElementById('proofReceivedAmount').value = data.debt;
  document.getElementById('proofAdminNote').value = '';

  // Lấy ảnh qua API bảo mật view_proof.php
  const imgUrl = CONFIG.API_URL + '/storage/view_proof.php?file=' + data.file;
  document.getElementById('proofImageDisplay').src = imgUrl;

  try {
    const res = await API.get('/admin/invoices/detail.php', { id: data.id });
    if (res && res.success && res.data) {
      const inv = res.data;
      document.getElementById('proofDetailsBox').innerHTML = `
        <strong>Hóa đơn:</strong> ${CONFIG.escapeHtml(inv.invoice_code)} - Phòng P.${CONFIG.escapeHtml(inv.room_number)}<br>
        <strong>Khách thuê:</strong> ${CONFIG.escapeHtml(inv.tenant_name || '')} (${CONFIG.escapeHtml(inv.tenant_phone || '')})<br>
        <strong>Tổng nợ:</strong> <span class="text-danger fw-bold">${CONFIG.formatCurrency(inv.debt_amount)}</span><br>
        <strong>Thời gian gửi bill:</strong> ${CONFIG.formatDateTime(inv.payment_proof_time)}<br>
        <strong>Ghi chú từ cư dân:</strong> ${CONFIG.escapeHtml(inv.payment_proof_note || 'Không có')}
      `;

      // Gắn sự kiện nút Duyệt và Từ chối
      document.getElementById('btnApproveProof').onclick = () => submitProofReview(inv.id, 'approve');
      document.getElementById('btnRejectProof').onclick = () => submitProofReview(inv.id, 'reject');

      reviewProofModal.show();
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi tải chi tiết hóa đơn đối soát.', 'error');
  }
}

async function submitProofReview(invoiceId, action) {
  const receivedAmount = parseFloat(document.getElementById('proofReceivedAmount').value) || 0;
  const adminNote = document.getElementById('proofAdminNote').value.trim();

  if (action === 'approve' && receivedAmount <= 0) {
    CONFIG.showToast('Vui lòng nhập số tiền thực nhận lớn hơn 0.', 'warning');
    return;
  }

  try {
    const res = await API.post('/admin/invoices/review_proof.php', {
      id: parseInt(invoiceId),
      action,
      received_amount: receivedAmount,
      admin_note: adminNote
    });

    if (res && res.success) {
      CONFIG.showToast(res.message || 'Xử lý minh chứng thành công.', 'success');
      reviewProofModal.hide();
      await loadInvoices(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể duyệt minh chứng.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi duyệt minh chứng.', 'error');
  }
}

async function handleDeleteInvoice(id, code) {
  if (!confirm(`Bạn có chắc chắn muốn xóa hóa đơn ${code}?`)) return;

  try {
    const res = await API.post('/admin/invoices/delete.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Đã xóa hóa đơn thành công.', 'success');
      await loadInvoices(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể xóa hóa đơn này.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi xóa hóa đơn.', 'error');
  }
}

