/**
 * ==============================================================================
 * JAVASCRIPT XỬ LÝ PHÂN QUYỀN & TÀI KHOẢN QUẢN TRỊ ADMIN (SUPERADMIN ONLY)
 * ==============================================================================
 * File: frontend/assets/js/admin/accounts.js
 * Nhiệm vụ:
 * 1. Gọi GET backend/api/admin/accounts/list.php tải danh sách tài khoản BQL.
 * 2. Mở modal #accountModal để thêm tài khoản mới (#btnAddAccount).
 * 3. Bắt sự kiện submit #accountForm:
 *    - Nếu accId rỗng => POST backend/api/admin/accounts/create.php.
 *    - Nếu accId có giá trị => POST backend/api/admin/accounts/update.php.
 * 4. Bắt sự kiện nút xóa #btnDeleteAccount => Hiển thị modal xác nhận, gọi POST backend/api/admin/accounts/delete.php.
 * 5. Cập nhật bảng #accountsTableBody mượt mà với Toast thông báo.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực quyền Admin
  const currentAdmin = await Auth.requireAdmin();
  if (!currentAdmin) return;

  // Khởi tạo Bootstrap Modal
  const modalEl = document.getElementById('accountModal');
  const accountModal = new bootstrap.Modal(modalEl);

  let accountsCache = [];

  // ============================================================================
  // HÀM 1: TẢI DANH SÁCH TÀI KHOẢN TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadAccounts
   * Giao diện gọi: Khi trang tải xong hoặc sau khi thêm/sửa/xóa tài khoản thành công.
   * API Backend: GET backend/api/admin/accounts/list.php
   * Trả về: Mảng JSON danh sách admins
   */
  async function loadAccounts() {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải danh sách tài khoản...
        </td>
      </tr>
    `;

    try {
      const res = await API.get('backend/api/admin/accounts/list.php');
      if (res.success && Array.isArray(res.data)) {
        accountsCache = res.data;
        renderAccountsTable(accountsCache);
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-4 text-danger">
              <i class="bi bi-exclamation-triangle me-1"></i> ${res.message || 'Không thể tải danh sách tài khoản hoặc bạn không có quyền superadmin.'}
            </td>
          </tr>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách tài khoản:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-danger">
            <i class="bi bi-x-circle me-1"></i> Đã xảy ra lỗi khi kết nối tới máy chủ.
          </td>
        </tr>
      `;
    }
  }

  // ============================================================================
  // HÀM 2: RENDER DỮ LIỆU BẢNG TÀI KHOẢN
  // ============================================================================
  function renderAccountsTable(accounts) {
    const tbody = document.getElementById('accountsTableBody');
    if (!accounts || accounts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">Chưa có tài khoản quản trị nào trong hệ thống.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = accounts.map(acc => {
      const roleBadge = acc.role === 'superadmin' 
        ? '<span class="badge bg-danger"><i class="bi bi-shield-lock-fill me-1"></i>Superadmin</span>' 
        : '<span class="badge bg-primary"><i class="bi bi-person-gear me-1"></i>Admin</span>';

      const lastLogin = acc.last_login 
        ? Utils.formatDateTime(acc.last_login) 
        : '<span class="text-muted small">Chưa đăng nhập</span>';

      // Không cho phép tự xóa chính mình
      const isSelf = currentAdmin.admin_id == acc.id;
      const deleteDisabled = isSelf ? 'disabled title="Không thể tự xóa chính mình"' : '';

      return `
        <tr>
          <td class="text-muted fw-bold">#${acc.id}</td>
          <td>
            <div class="fw-bold text-dark">${Utils.escapeHtml(acc.fullname)}</div>
            <div class="small text-muted font-monospace"><i class="bi bi-person me-1"></i>${Utils.escapeHtml(acc.username)}</div>
          </td>
          <td>
            <a href="mailto:${Utils.escapeHtml(acc.email)}" class="text-decoration-none small">
              <i class="bi bi-envelope me-1"></i>${Utils.escapeHtml(acc.email)}
            </a>
          </td>
          <td>
            <span class="small">${Utils.escapeHtml(acc.phone || 'Chưa cập nhật')}</span>
          </td>
          <td>${roleBadge}</td>
          <td class="small text-muted">${lastLogin}</td>
          <td class="text-center">
            <div class="btn-group btn-group-sm">
              <!-- NÚT: Sửa tài khoản (btn-edit-account) -->
              <button class="btn btn-outline-secondary btn-edit-account" data-id="${acc.id}" title="Chỉnh sửa thông tin">
                <i class="bi bi-pencil-square"></i>
              </button>
              <!-- NÚT: Xóa tài khoản (btn-delete-account) -->
              <button class="btn btn-outline-danger btn-delete-account" data-id="${acc.id}" data-name="${Utils.escapeHtml(acc.fullname)}" ${deleteDisabled} title="Xóa tài khoản">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ============================================================================
  // SỰ KIỆN NÚT 1: BẤM NÚT #btnAddAccount (MỞ MODAL THÊM TÀI KHOẢN MỚI)
  // ============================================================================
  // Xử lý hoàn toàn trên frontend: reset form và mở modal.
  document.getElementById('btnAddAccount').addEventListener('click', function () {
    document.getElementById('accountForm').reset();
    document.getElementById('accId').value = '';
    document.getElementById('accountModalTitle').textContent = 'Thêm quản trị viên mới';
    
    // Khi thêm mới: cho phép nhập username và bắt buộc mật khẩu
    const usernameInput = document.getElementById('accUsername');
    usernameInput.removeAttribute('readonly');
    usernameInput.classList.remove('bg-light');
    
    document.getElementById('accPassword').setAttribute('required', 'required');
    document.getElementById('accPasswordLabel').innerHTML = 'Mật khẩu đăng nhập <span class="text-danger">*</span>';
    document.getElementById('accPasswordHelp').textContent = 'Tối thiểu 6 ký tự.';

    accountModal.show();
  });

  // ============================================================================
  // SỰ KIỆN NÚT 2: BẤM NÚT SỬA .btn-edit-account (LẤY DỮ LIỆU ĐIỀN VÀO MODAL)
  // ============================================================================
  document.getElementById('accountsTableBody').addEventListener('click', function (e) {
    const btnEdit = e.target.closest('.btn-edit-account');
    if (!btnEdit) return;

    const accId = btnEdit.getAttribute('data-id');
    const acc = accountsCache.find(a => a.id == accId);
    if (!acc) return;

    document.getElementById('accountForm').reset();
    document.getElementById('accId').value = acc.id;
    document.getElementById('accountModalTitle').textContent = `Chỉnh sửa quản trị viên #${acc.id}`;
    
    // Tên đăng nhập cố định khi sửa
    const usernameInput = document.getElementById('accUsername');
    usernameInput.value = acc.username;
    usernameInput.setAttribute('readonly', 'readonly');
    usernameInput.classList.add('bg-light');

    document.getElementById('accFullname').value = acc.fullname;
    document.getElementById('accEmail').value = acc.email;
    document.getElementById('accPhone').value = acc.phone || '';
    document.getElementById('accRole').value = acc.role;

    // Khi sửa: mật khẩu không bắt buộc, chỉ đổi nếu nhập
    const passInput = document.getElementById('accPassword');
    passInput.removeAttribute('required');
    passInput.value = '';
    document.getElementById('accPasswordLabel').innerHTML = 'Đổi mật khẩu mới (Nếu có nhu cầu)';
    document.getElementById('accPasswordHelp').textContent = 'Để trống nếu muốn giữ nguyên mật khẩu cũ.';

    accountModal.show();
  });

  // ============================================================================
  // SỰ KIỆN FORM 3: SUBMIT FORM #accountForm (LƯU TÀI KHOẢN MỚI HOẶC CẬP NHẬT)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #accountForm
   * Luồng:
   * 1. Lấy dữ liệu các trường input.
   * 2. Nếu id rỗng: gọi POST backend/api/admin/accounts/create.php.
   * 3. Nếu id có giá trị: gọi POST backend/api/admin/accounts/update.php.
   * 4. Nhận JSON: nếu success == true => hiển thị toast, đóng modal, reload lại bảng.
   */
  document.getElementById('accountForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const saveBtn = document.getElementById('btnSaveAccount');
    const originalBtnHtml = saveBtn.innerHTML;

    const id = document.getElementById('accId').value;
    const isEdit = !!id;

    const payload = {
      fullname: document.getElementById('accFullname').value.trim(),
      email: document.getElementById('accEmail').value.trim(),
      phone: document.getElementById('accPhone').value.trim(),
      role: document.getElementById('accRole').value,
      password: document.getElementById('accPassword').value
    };

    if (!isEdit) {
      payload.username = document.getElementById('accUsername').value.trim();
    } else {
      payload.id = id;
    }

    try {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang lưu...';

      const endpoint = isEdit ? 'backend/api/admin/accounts/update.php' : 'backend/api/admin/accounts/create.php';
      const res = await API.post(endpoint, payload);

      if (res.success) {
        Utils.showToast(res.message || 'Lưu tài khoản quản trị thành công!', 'success');
        accountModal.hide();
        loadAccounts();
      } else {
        Utils.showToast(res.message || 'Không thể lưu tài khoản', 'danger');
      }
    } catch (err) {
      console.error('Lỗi lưu tài khoản admin:', err);
      Utils.showToast('Lỗi máy chủ khi lưu tài khoản quản trị', 'danger');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnHtml;
    }
  });

  // ============================================================================
  // SỰ KIỆN NÚT 4: BẤM NÚT XÓA .btn-delete-account (XÓA TÀI KHOẢN)
  // ============================================================================
  /**
   * Bắt sự kiện click nút .btn-delete-account
   * Luồng:
   * 1. Hiển thị xác nhận qua Utils.confirmModal.
   * 2. Gọi POST backend/api/admin/accounts/delete.php với payload { id }.
   * 3. Nhận JSON: nếu thành công, hiển thị toast và tải lại danh sách.
   */
  document.getElementById('accountsTableBody').addEventListener('click', async function (e) {
    const btnDel = e.target.closest('.btn-delete-account');
    if (!btnDel) return;

    const accId = btnDel.getAttribute('data-id');
    const accName = btnDel.getAttribute('data-name');

    const confirmed = await Utils.confirmModal(
      `Bạn có chắc chắn muốn xóa tài khoản quản trị viên <strong>${accName}</strong> (#${accId}) không? Thao tác này sẽ không thể khôi phục!`
    );
    if (!confirmed) return;

    try {
      btnDel.disabled = true;
      const res = await API.post('backend/api/admin/accounts/delete.php', { id: accId });
      if (res.success) {
        Utils.showToast(res.message || 'Đã xóa tài khoản quản trị thành công!', 'success');
        loadAccounts();
      } else {
        Utils.showToast(res.message || 'Không thể xóa tài khoản', 'danger');
        btnDel.disabled = false;
      }
    } catch (err) {
      console.error('Lỗi khi xóa tài khoản admin:', err);
      Utils.showToast('Lỗi hệ thống khi xóa tài khoản', 'danger');
      btnDel.disabled = false;
    }
  });

  // Tải danh sách tài khoản ngay khi vào trang
  loadAccounts();
});

