/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ NGƯỜI THUÊ & HỢP ĐỒNG (ADMIN TENANTS JS)
 * ============================================================================
 * - Nạp danh sách: GET backend/api/admin/tenants/list.php
 * - Lập hợp đồng: POST backend/api/admin/tenants/create.php (Transaction gán phòng)
 * - Cập nhật: POST backend/api/admin/tenants/update.php
 * - Kết thúc thuê: POST backend/api/admin/tenants/end_contract.php (Transaction trả phòng)
 * - Xử lý gia hạn: POST backend/api/admin/tenants/process_extension.php
 * - Khóa/mở Cổng: POST backend/api/admin/tenants/toggle_portal.php
 * - Cấp lại mật khẩu: POST backend/api/admin/tenants/reset_password.php
 */

let currentPage = 1;
let currentFilters = {};
let tenantModal = null;
let extModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Quản Lý Người Thuê & Cư Dân';

  tenantModal = new bootstrap.Modal(document.getElementById('tenantModal'));
  extModal = new bootstrap.Modal(document.getElementById('processExtensionModal'));

  await loadRoomsForSelect();
  await loadTenants(1);
  initEventListeners();
});

async function loadRoomsForSelect() {
  try {
    const res = await API.get('/admin/rooms/list.php', { limit: 50 });
    if (res && res.success && res.data) {
      const select = document.getElementById('tenantRoomId');
      select.innerHTML = '<option value="">-- Chọn phòng trọ --</option>';
      res.data.items.forEach(r => {
        const isFree = (r.status === 'available');
        const badge = isFree ? '[Trống]' : (r.status === 'rented' ? '[Đã thuê]' : '[Bảo trì]');
        select.innerHTML += `<option value="${r.id}">Phòng ${CONFIG.escapeHtml(r.room_number)} (Tầng ${r.floor}) - ${CONFIG.formatCurrency(r.price)} ${badge}</option>`;
      });
    }
  } catch (e) {
    console.error('Lỗi nạp danh sách phòng:', e);
  }
}

async function loadTenants(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('tenantsTableBody');
  tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải danh sách cư dân...</td></tr>';

  try {
    const params = {
      page: currentPage,
      limit: 10,
      ...currentFilters
    };

    const res = await API.get('/admin/tenants/list.php', params);
    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderTenantsTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">${res.message || 'Lỗi tải danh sách.'}</td></tr>`;
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-danger">Lỗi kết nối máy chủ khi nạp danh sách cư dân.</td></tr>';
  }
}

function renderTenantsTable(tenants) {
  const tbody = document.getElementById('tenantsTableBody');
  if (!tenants || tenants.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">Không tìm thấy người thuê nào.</td></tr>';
    return;
  }

  let html = '';
  tenants.forEach(t => {
    const hasExtension = (t.extension_status && t.extension_status !== 'none');
    const roomText = t.room_number
      ? `<span class="badge bg-dark fw-bold fs-6">P.${CONFIG.escapeHtml(t.room_number)}</span>`
      : '<span class="badge bg-secondary-subtle text-muted border">Chưa gán phòng</span>';
//177
    const portalHtml = (t.portal_status == 1)
      ? `<div class="mb-1"><span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle-fill me-1"></i>Đã duyệt</span></div>
         <button class="btn btn-sm btn-outline-danger p-1 py-0 fs-7 btn-toggle-portal" data-id="${t.id}" data-status="1" title="Khóa quyền truy cập Cổng cư dân">
           <i class="bi bi-lock-fill me-1"></i>Khóa
         </button>`
      : `<div class="mb-1"><span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Chờ BQL duyệt</span></div>
         <button class="btn btn-sm btn-success p-1 py-0 fs-7 fw-bold shadow-sm btn-toggle-portal" data-id="${t.id}" data-status="0" title="Duyệt mở quyền truy cập Cổng cư dân">
           <i class="bi bi-check2-circle me-1"></i>Duyệt tài khoản
         </button>`;

    html += `
      <tr>
        <td>
          <div class="fw-bold text-dark">${CONFIG.escapeHtml(t.fullname)}</div>
          <small class="text-muted"><i class="bi bi-telephone me-1"></i>${CONFIG.escapeHtml(t.phone)}</small>
          ${t.email ? `<div class="small text-muted"><i class="bi bi-envelope me-1"></i>${CONFIG.escapeHtml(t.email)}</div>` : ''}
          ${t.id_card ? `<div class="small text-muted font-monospace"><i class="bi bi-card-heading me-1"></i>${CONFIG.escapeHtml(t.id_card)}</div>` : ''}
        </td>
        <td>
          ${roomText}
        </td>
        <td class="small">
          <div><i class="bi bi-calendar-event text-primary"></i> ${CONFIG.formatDate(t.contract_start)}</div>
          <div class="text-muted"><i class="bi bi-arrow-right"></i> ${CONFIG.formatDate(t.contract_end)}</div>
        </td>
        <td><strong>${CONFIG.formatCurrency(t.deposit_amount)}</strong></td>
        <td class="small">
          <div><i class="bi bi-people me-1"></i>${t.occupant_count || 1} người</div>
          <div><i class="bi bi-bicycle me-1"></i>${t.vehicle_count || 1} xe máy</div>
        </td>
        <td>
          ${CONFIG.getStatusBadge('extension', t.extension_status)}
          ${hasExtension ? `
            <div class="mt-1">
              <button class="btn btn-warning btn-sm p-1 py-0 fs-7 btn-review-ext" data-id="${t.id}" title="Xử lý yêu cầu">
                <i class="bi bi-gear-fill me-1"></i> Xử lý
              </button>
            </div>
          ` : ''}
        </td>
        <td>
          ${portalHtml}
        </td>
        <td>${CONFIG.getStatusBadge('tenant_status', t.status)}</td>
        <td class="text-center">
          <div class="dropdown">
           <!-- Nút bấm chính mở dropdown -->
            <button class="btn btn-light btn-sm border dropdown-toggle" type="button" data-bs-toggle="dropdown">
              Thao tác
            </button>
              <!-- Danh sách 3 chức năng bên trong menu -->
            <ul class="dropdown-menu dropdown-menu-end shadow">
              <li>
                <a class="dropdown-item btn-edit-tenant" href="#" data-id="${t.id}"> //172
                  <i class="bi bi-pencil-square me-2 text-primary"></i> Sửa hợp đồng
                </a>
              </li>
              <li>
                <a class="dropdown-item btn-reset-pw" href="#" data-id="${t.id}" data-name="${CONFIG.escapeHtml(t.fullname)}">
                  <i class="bi bi-key me-2 text-warning"></i> Cấp lại mật khẩu
                </a>
              </li>
              // Chỉ những người thuê đang có hợp đồng hiệu lực (status === 'active') mới có nút này(198-)
              ${t.status === 'active' ? `
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger btn-end-tenancy" href="#" data-id="${t.id}" data-name="${CONFIG.escapeHtml(t.fullname)}" data-room="${roomText}">
                    <i class="bi bi-box-arrow-right me-2"></i> Kết thúc hợp đồng (Trả phòng)
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
  bindTableActionEvents();
}

function bindTableActionEvents() {
  document.querySelectorAll('.btn-edit-tenant').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      openEditTenant(b.getAttribute('data-id'));  // // Gọi hàm mở modal sửa 266
    });
  });
//bắt sự kiện click khóa/mở quyền truy cập Cổng cư dân
  document.querySelectorAll('.btn-toggle-portal').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const current = parseInt(b.getAttribute('data-status')); //đang là 1 (đã duyệt) hay 0 (chưa duyệt)
      handleTogglePortal(id, current === 1 ? 0 : 1);
    });
  });

  document.querySelectorAll('.btn-review-ext').forEach(b => {
    b.addEventListener('click', () => {
      openProcessExtension(b.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.btn-reset-pw').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      handleResetPassword(b.getAttribute('data-id'), b.getAttribute('data-name'));
    });
  });

  document.querySelectorAll('.btn-end-tenancy').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      handleEndTenancy(b.getAttribute('data-id'), b.getAttribute('data-name'), b.getAttribute('data-room'));
    });
  });
}

function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;
  const { page, total, total_pages } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} người thuê)`;

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
      if (p && p !== currentPage) loadTenants(p);
    });
  });
}

function initEventListeners() {
  document.getElementById('tenantFilterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentFilters = {
      keyword: document.getElementById('filterKeyword').value.trim(),
      status: document.getElementById('filterStatus').value,
      portal_status: document.getElementById('filterPortalStatus').value,
      extension_status: document.getElementById('filterExtension').value
    };
    loadTenants(1);
  });

  document.getElementById('btnResetFilter').addEventListener('click', () => {
    document.getElementById('tenantFilterForm').reset();
    currentFilters = {};
    loadTenants(1);
  });

  document.getElementById('btnAddTenant').addEventListener('click', () => {
    document.getElementById('tenantForm').reset();
    document.getElementById('tenantId').value = '';
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('tenantStart').value = new Date().toISOString().split('T')[0];
    document.getElementById('tenantModalTitle').textContent = 'Lập hợp đồng thuê mới';
    tenantModal.show();
  });

  document.getElementById('tenantForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveTenant();
  });
}
// kích hoạt thanh chờ và gọi ngầm: api/admin
async function openEditTenant(id) {
  try {
    API.showLoading();
    const res = await API.get('/admin/tenants/detail.php', { id });
    if (res && res.success && res.data) {
      const t = res.data;
      document.getElementById('tenantId').value = t.id;
      document.getElementById('tenantFullname').value = t.fullname;
      document.getElementById('tenantPhone').value = t.phone;
      document.getElementById('tenantEmail').value = t.email || '';
      document.getElementById('tenantIdCard').value = t.id_card || '';
      document.getElementById('tenantHometown').value = t.hometown || '';
      document.getElementById('tenantRoomId').value = t.room_id || '';
      document.getElementById('tenantDeposit').value = t.deposit_amount || 0;
      document.getElementById('tenantStart').value = t.contract_start || '';
      document.getElementById('tenantEnd').value = t.contract_end || '';
      document.getElementById('tenantOccupants').value = t.occupant_count || 1;
      document.getElementById('tenantVehicles').value = t.vehicle_count || 1;
      document.getElementById('tenantContractNotes').value = t.contract_notes || '';
      document.getElementById('tenantNote').value = t.note || '';

      // Khi sửa, ẩn nhóm nhập mật khẩu (dùng nút Đặt lại mật khẩu riêng)
      document.getElementById('passwordGroup').style.display = 'none';

      document.getElementById('tenantModalTitle').textContent = `Cập nhật hợp đồng cư dân: ${t.fullname}`; //dòng 303
      tenantModal.show();
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi tải thông tin cư dân.', 'error');
  } finally {
    API.hideLoading();
  }
}
//gom tất cả các trường dữ liệu trên form vào biến payload.
async function handleSaveTenant() {
  const form = document.getElementById('tenantForm');
  const btnSave = document.getElementById('btnSaveTenant');
  const id = document.getElementById('tenantId').value;
  const isEdit = Boolean(id);

  const payload = {
    id: id ? parseInt(id) : undefined,
    fullname: document.getElementById('tenantFullname').value.trim(),
    phone: document.getElementById('tenantPhone').value.trim(),
    email: document.getElementById('tenantEmail').value.trim(),
    password: document.getElementById('tenantPassword').value.trim(),
    id_card: document.getElementById('tenantIdCard').value.trim(),
    hometown: document.getElementById('tenantHometown').value.trim(),
    room_id: document.getElementById('tenantRoomId').value,
    deposit_amount: parseFloat(document.getElementById('tenantDeposit').value) || 0,
    contract_start: document.getElementById('tenantStart').value,
    contract_end: document.getElementById('tenantEnd').value,
    occupant_count: parseInt(document.getElementById('tenantOccupants').value) || 1,
    vehicle_count: parseInt(document.getElementById('tenantVehicles').value) || 1,
    contract_notes: document.getElementById('tenantContractNotes').value.trim(),
    note: document.getElementById('tenantNote').value.trim()
  };
// Backend kiểm tra tính hợp lệ & Cập nhật MySQL
  const endpoint = isEdit ? '/admin/tenants/update.php' : '/admin/tenants/create.php';

  try {
    const res = await API.post(endpoint, payload, { buttonToDisable: btnSave });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Lưu hợp đồng thành công!', 'success');
      tenantModal.hide();
      await loadTenants(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể lưu hợp đồng.', 'error');
    }
  } catch (e) {
    console.error('Lỗi khi lưu hợp đồng:', e);
    if (e && e.message && !e.message.includes('CSRF') && !e.message.includes('Truy cập bị từ chối')) {
      CONFIG.showToast(e.message || 'Lỗi khi lưu hợp đồng.', 'error');
    }
  }
}

async function handleEndTenancy(id, name, room) {
  if (!confirm(`Bạn có chắc muốn KẾT THÚC HỢP ĐỒNG và hoàn tất trả phòng cho cư dân ${name} (${room})?\n\nPhòng sẽ được chuyển về trạng thái 'Còn trống' và lịch sử thuê vẫn được lưu trữ nguyên vẹn.`)) {
    return;
  }

  try {
    const res = await API.post('/admin/tenants/end_contract.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Đã kết thúc hợp đồng thuê thành công.', 'success');
      await loadTenants(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể kết thúc hợp đồng.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi kết thúc hợp đồng.', 'error');
  }
}

async function handleTogglePortal(id, newStatus) {
  try {
    const res = await API.post('/admin/tenants/toggle_portal.php', { id: parseInt(id), status: newStatus });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Cập nhật trạng thái Cổng cư dân thành công.', 'success');
      await loadTenants(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Lỗi khi cập nhật portal.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ.', 'error');
  }
}

async function handleResetPassword(id, name) {
  const newPw = prompt(`Nhập mật khẩu mới cấp cho cư dân ${name} (Tối thiểu 6 ký tự):`, 'tenant123');
  if (!newPw) return;

  try {
    const res = await API.post('/admin/tenants/reset_password.php', { id: parseInt(id), new_password: newPw });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Đã cấp mật khẩu mới thành công.', 'success');
    } else {
      CONFIG.showToast(res.message || 'Lỗi cấp mật khẩu.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối máy chủ.', 'error');
  }
}

async function openProcessExtension(id) {
  try {
    API.showLoading();
    const res = await API.get('/admin/tenants/detail.php', { id });
    if (res && res.success && res.data) {
      const t = res.data;
      document.getElementById('extTenantId').value = t.id;
      const typeText = (t.extension_status === 'requested_extension') ? 'Xin gia hạn hợp đồng' : 'Xin trả phòng';

      document.getElementById('extDetailsBox').innerHTML = `
        <strong>Cư dân:</strong> ${CONFIG.escapeHtml(t.fullname)} - Phòng P.${CONFIG.escapeHtml(t.room_number || '')}<br>
        <strong>Loại yêu cầu:</strong> <span class="badge bg-warning text-dark">${typeText}</span><br>
        <strong>Nội dung cư dân gửi:</strong> ${CONFIG.escapeHtml(t.extension_note || 'Không có ghi chú')}
      `;

      // Nếu xin gia hạn, hiện ô chọn ngày gia hạn mới
      const isExt = (t.extension_status === 'requested_extension');
      document.getElementById('extNewDateGroup').style.display = isExt ? 'block' : 'none';

      // Gắn sự kiện nút Duyệt và Từ chối
      document.getElementById('btnApproveExtension').onclick = () => submitExtensionDecision(t.id, isExt ? 'approve_extension' : 'approve_leave');
      document.getElementById('btnRejectExtension').onclick = () => submitExtensionDecision(t.id, 'reject_extension');

      extModal.show();
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi tải yêu cầu gia hạn.', 'error');
  } finally {
    API.hideLoading();
  }
}

async function submitExtensionDecision(id, action) {
  const newEndDate = document.getElementById('extNewEndDate').value;
  const adminNote = document.getElementById('extAdminNote').value.trim();

  try {
    const res = await API.post('/admin/tenants/process_extension.php', {
      id: parseInt(id),
      action,
      new_end_date: newEndDate,
      admin_note: adminNote
    });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Xử lý yêu cầu thành công.', 'success');
      extModal.hide();
      await loadTenants(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể xử lý yêu cầu.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi xử lý yêu cầu.', 'error');
  }
}

