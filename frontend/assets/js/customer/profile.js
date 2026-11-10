/**
 * ==============================================================================
 * JAVASCRIPT QUẢN LÝ HỒ SƠ KHÁCH HÀNG (CUSTOMER PROFILE & CHANGE PASSWORD)
 * ==============================================================================
 * File: frontend/assets/js/customer/profile.js
 * Nhiệm vụ:
 * 1. Kiểm tra xác thực khách hàng (Auth.requireUser).
 * 2. Tải thông tin hồ sơ: GET backend/api/customer/profile/get.php.
 * 3. Bắt sự kiện submit form cập nhật hồ sơ #userProfileForm:
 *    - Gửi POST backend/api/customer/profile/update.php
 *    - Hiển thị Toast thông báo và cập nhật tiêu đề chào.
 * 4. Bắt sự kiện submit form đổi mật khẩu #userPasswordForm:
 *    - Gửi POST backend/api/customer/profile/change_password.php
 *    - Hiển thị Toast thông báo và reset form mật khẩu.
 * 5. Bắt sự kiện đăng xuất #btnLogoutUser:
 *    - Gửi POST backend/api/auth/user_logout.php
 *    - Chuyển hướng về frontend/public/login.html
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra xác thực đăng nhập của khách hàng
  const currentUser = await Auth.requireUser();
  if (!currentUser) return;

  // ============================================================================
  // HÀM 1: TẢI THÔNG TIN HỒ SƠ KHÁCH HÀNG
  // ============================================================================
  /**
   * Tên hàm: loadCustomerProfile
   * Giao diện gọi: Chạy khi trang tải xong
   * API Backend: GET backend/api/customer/profile/get.php
   * Trả về: { success: true, data: { id, username, fullname, email, phone, avatar, created_at } }
   * Cập nhật UI: Đổ dữ liệu vào các ô input của #userProfileForm và avatar
   */
  async function loadCustomerProfile() {
    try {
      const res = await API.get('backend/api/customer/profile/get.php');
      if (res.success && res.data) {
        const u = res.data;
        document.getElementById('userGreetingName').textContent = u.fullname || u.username;
        document.getElementById('profileUsername').value = u.username;
        document.getElementById('profileFullname').value = u.fullname || '';
        document.getElementById('profileEmail').value = u.email || '';
        document.getElementById('profilePhone').value = u.phone || '';

        if (u.avatar) {
          const avatarUrl = u.avatar.startsWith('http') ? u.avatar : `${APP_CONFIG.BASE_URL}/${u.avatar}`;
          document.getElementById('userAvatarImg').src = avatarUrl;
        }
      } else {
        Utils.showToast(res.message || 'Không thể tải thông tin hồ sơ', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ khách hàng:', err);
      Utils.showToast('Lỗi máy chủ khi tải hồ sơ khách hàng', 'danger');
    }
  }

  // ============================================================================
  // SỰ KIỆN FORM 2: SUBMIT CẬP NHẬT HỒ SƠ (#userProfileForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #userProfileForm
   * Luồng:
   * 1. Lấy fullname, email, phone.
   * 2. Gọi POST backend/api/customer/profile/update.php.
   * 3. Nhận JSON từ backend: hiển thị toast, cập nhật greeting text trên giao diện.
   */
  document.getElementById('userProfileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const saveBtn = document.getElementById('btnSaveProfile');
    const originalBtnHtml = saveBtn.innerHTML;

    const payload = {
      fullname: document.getElementById('profileFullname').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      phone: document.getElementById('profilePhone').value.trim()
    };

    try {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu...';

      const res = await API.post('backend/api/customer/profile/update.php', payload);

      if (res.success) {
        Utils.showToast(res.message || 'Cập nhật hồ sơ thành công!', 'success');
        document.getElementById('userGreetingName').textContent = payload.fullname;
      } else {
        Utils.showToast(res.message || 'Không thể cập nhật hồ sơ', 'danger');
      }
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      Utils.showToast('Lỗi hệ thống khi cập nhật hồ sơ', 'danger');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnHtml;
    }
  });

  // ============================================================================
  // SỰ KIỆN FORM 3: SUBMIT ĐỔI MẬT KHẨU (#userPasswordForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #userPasswordForm
   * Luồng:
   * 1. Kiểm tra newPassword === confirmNewPassword.
   * 2. Gọi POST backend/api/customer/profile/change_password.php.
   * 3. Nhận JSON từ backend: nếu thành công thì hiển thị Toast và reset các ô mật khẩu.
   */
  document.getElementById('userPasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const changeBtn = document.getElementById('btnChangePassword');
    const originalBtnHtml = changeBtn.innerHTML;

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      Utils.showToast('Mật khẩu mới và mật khẩu xác nhận không trùng khớp!', 'warning');
      return;
    }

    try {
      changeBtn.disabled = true;
      changeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang đổi mật khẩu...';

      const res = await API.post('backend/api/customer/profile/change_password.php', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmNewPassword
      });

      if (res.success) {
        Utils.showToast(res.message || 'Đổi mật khẩu tài khoản thành công!', 'success');
        document.getElementById('userPasswordForm').reset();
      } else {
        Utils.showToast(res.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.', 'danger');
      }
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      Utils.showToast('Lỗi máy chủ khi đổi mật khẩu', 'danger');
    } finally {
      changeBtn.disabled = false;
      changeBtn.innerHTML = originalBtnHtml;
    }
  });

  // ============================================================================
  // SỰ KIỆN NÚT 4: ĐĂNG XUẤT TÀI KHOẢN KHÁCH HÀNG (#btnLogoutUser)
  // ============================================================================
  document.getElementById('btnLogoutUser').addEventListener('click', async function () {
    try {
      await API.post('backend/api/auth/user_logout.php');
      window.location.href = '../public/login.html';
    } catch (e) {
      window.location.href = '../public/login.html';
    }
  });

  // Tải dữ liệu ban đầu
  loadCustomerProfile();
});

