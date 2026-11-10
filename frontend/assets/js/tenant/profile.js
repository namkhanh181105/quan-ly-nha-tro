/**
 * ==============================================================================
 * JAVASCRIPT HỒ SƠ CƯ DÂN & ĐỔI MẬT KHẨU CỔNG CƯ DÂN
 * ==============================================================================
 * File: frontend/assets/js/tenant/profile.js
 * Nhiệm vụ:
 * 1. Kiểm tra xác thực cư dân (Auth.requireTenant).
 * 2. Gọi GET backend/api/tenant/profile/get.php để tải thông tin cư dân.
 * 3. Bắt sự kiện chọn ảnh avatar => Preview trước trên giao diện.
 * 4. Bắt sự kiện submit form #tenantProfileForm:
 *    - Tạo FormData chứa fullname, phone, hometown, license_plate và avatar file.
 *    - Gửi POST backend/api/tenant/profile/update.php.
 *    - Cập nhật ảnh và tên hiển thị ở header.
 * 5. Bắt sự kiện submit form #tenantPasswordForm:
 *    - Gửi POST backend/api/tenant/profile/change_password.php.
 *    - Hiển thị Toast thông báo và reset form mật khẩu.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // 1. Kiểm tra quyền cư dân
  const currentTenant = await Auth.requireTenant();
  if (!currentTenant) return;

  // ============================================================================
  // HÀM 1: TẢI HỒ SƠ CƯ DÂN TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadTenantProfile
   * Giao diện gọi: Chạy khi tải trang
   * API Backend: GET backend/api/tenant/profile/get.php
   * Trả về: { success: true, data: { id, fullname, email, phone, id_card, hometown, license_plate, avatar, ... } }
   * Cập nhật UI: Điền các giá trị vào input và avatar preview
   */
  async function loadTenantProfile() {
    try {
      const res = await API.get('backend/api/tenant/profile/get.php');
      if (res.success && res.data) {
        const t = res.data;
        document.getElementById('tenantFullname').value = t.fullname || '';
        document.getElementById('tenantPhone').value = t.phone || '';
        document.getElementById('tenantEmail').value = t.email || '';
        document.getElementById('tenantIdCard').value = t.id_card || '';
        document.getElementById('tenantHometown').value = t.hometown || '';
        document.getElementById('tenantLicensePlate').value = t.license_plate || '';

        if (t.avatar) {
          const avatarUrl = t.avatar.startsWith('http') ? t.avatar : `${APP_CONFIG.BASE_URL}/${t.avatar}`;
          document.getElementById('profileAvatarPreview').src = avatarUrl;
        }
      } else {
        Utils.showToast(res.message || 'Không thể tải hồ sơ cư dân', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi tải hồ sơ:', err);
      Utils.showToast('Lỗi máy chủ khi tải thông tin cư dân', 'danger');
    }
  }

  // ============================================================================
  // SỰ KIỆN: XEM TRƯỚC ẢNH AVATAR KHI CHỌN FILE
  // ============================================================================
  document.getElementById('tenantAvatarFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        document.getElementById('profileAvatarPreview').src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // ============================================================================
  // SỰ KIỆN FORM 2: SUBMIT CẬP NHẬT HỒ SƠ (#tenantProfileForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #tenantProfileForm
   * Luồng:
   * 1. Gom dữ liệu vào FormData (vì có file upload avatar).
   * 2. Gọi POST backend/api/tenant/profile/update.php.
   * 3. Nhận JSON từ backend: hiển thị Toast, cập nhật lại avatar và tên trên header.
   */
  document.getElementById('tenantProfileForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const saveBtn = document.getElementById('btnSaveProfile');
    const originalBtnHtml = saveBtn.innerHTML;

    const formData = new FormData();
    formData.append('fullname', document.getElementById('tenantFullname').value.trim());
    formData.append('phone', document.getElementById('tenantPhone').value.trim());
    formData.append('hometown', document.getElementById('tenantHometown').value.trim());
    formData.append('license_plate', document.getElementById('tenantLicensePlate').value.trim());

    const avatarFile = document.getElementById('tenantAvatarFile').files[0];
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang lưu hồ sơ...';

      const res = await API.post('backend/api/tenant/profile/update.php', formData);

      if (res.success) {
        Utils.showToast(res.message || 'Cập nhật hồ sơ cư dân thành công!', 'success');
        // Tải lại để cập nhật đồng bộ các thành phần
        loadTenantProfile();
      } else {
        Utils.showToast(res.message || 'Không thể cập nhật hồ sơ', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi lưu hồ sơ cư dân:', err);
      Utils.showToast('Lỗi máy chủ khi lưu hồ sơ', 'danger');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnHtml;
    }
  });

  // ============================================================================
  // SỰ KIỆN FORM 3: SUBMIT ĐỔI MẬT KHẨU (#tenantPasswordForm)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #tenantPasswordForm
   * Luồng:
   * 1. Kiểm tra khớp mật khẩu mới.
   * 2. Gọi POST backend/api/tenant/profile/change_password.php.
   * 3. Nhận JSON: thông báo thành công hoặc báo lỗi nếu mật khẩu cũ sai.
   */
  document.getElementById('tenantPasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const changeBtn = document.getElementById('btnChangePassword');
    const originalBtnHtml = changeBtn.innerHTML;

    const curPass = document.getElementById('tenantCurrentPassword').value;
    const newPass = document.getElementById('tenantNewPassword').value;
    const confirmPass = document.getElementById('tenantConfirmNewPassword').value;

    if (newPass !== confirmPass) {
      Utils.showToast('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!', 'warning');
      return;
    }

    try {
      changeBtn.disabled = true;
      changeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang cập nhật mật khẩu...';

      const res = await API.post('backend/api/tenant/profile/change_password.php', {
        current_password: curPass,
        new_password: newPass,
        confirm_password: confirmPass
      });

      if (res.success) {
        Utils.showToast(res.message || 'Đổi mật khẩu Cổng Cư Dân thành công!', 'success');
        document.getElementById('tenantPasswordForm').reset();
      } else {
        Utils.showToast(res.message || 'Mật khẩu hiện tại không chính xác!', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi đổi mật khẩu cư dân:', err);
      Utils.showToast('Lỗi máy chủ khi đổi mật khẩu', 'danger');
    } finally {
      changeBtn.disabled = false;
      changeBtn.innerHTML = originalBtnHtml;
    }
  });

  // Khởi chạy
  loadTenantProfile();
});

