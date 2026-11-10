/**
 * ==============================================================================
 * JAVASCRIPT XỬ LÝ ĐĂNG KÝ TÀI KHOẢN CƯ DÂN (TENANT REGISTRATION)
 * ==============================================================================
 * File: frontend/assets/js/public/auth.js
 * Nhiệm vụ:
 * Bắt sự kiện submit form đăng ký cư dân #userRegisterForm trên register.html:
 * - Thu thập họ tên, số điện thoại, email, mật khẩu
 * - Gọi POST backend/api/auth/tenant_register.php
 * - Tài khoản tạo mới có portal_status = 0 (Chờ Ban Quản Lý duyệt)
 * - Hiển thị thông báo hướng dẫn và chuyển hướng sang Cổng Cư Dân (tenant/login.html)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  // ============================================================================
  // XỬ LÝ ĐĂNG KÝ CƯ DÂN (#userRegisterForm)
  // ============================================================================
  const registerForm = document.getElementById('userRegisterForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btnReg = document.getElementById('btnUserRegister');
      const originalBtnHtml = btnReg.innerHTML;

      const fullname = (document.getElementById('userRegFullname')?.value || '').trim();
      const phone = (document.getElementById('userRegPhone')?.value || '').trim();
      const email = (document.getElementById('userRegEmail')?.value || '').trim();
      const password = document.getElementById('userRegPassword')?.value || '';
      const confirmPassword = document.getElementById('userRegConfirmPassword')?.value || '';

      if (!fullname || !phone || !password) {
        CONFIG.showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và mật khẩu!', 'warning');
        return;
      }

      if (password.length < 6) {
        CONFIG.showToast('Mật khẩu phải chứa ít nhất 6 ký tự!', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        CONFIG.showToast('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.', 'warning');
        return;
      }

      const payload = {
        fullname: fullname,
        phone: phone,
        email: email,
        password: password
      };

      try {
        btnReg.disabled = true;
        btnReg.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý đăng ký...';

        const res = await API.post('/auth/tenant_register.php', payload);

        if (res && res.success) {
          CONFIG.showToast(res.message || 'Đăng ký tài khoản cư dân thành công! Tài khoản đang chờ BQL phê duyệt.', 'success');
          // Khóa form để tránh bấm lại
          btnReg.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Đăng ký thành công! Đang chuyển hướng...';
          setTimeout(() => {
            window.location.href = '../tenant/login.html';
          }, 2000);
        } else {
          CONFIG.showToast(res.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.', 'danger');
          btnReg.disabled = false;
          btnReg.innerHTML = originalBtnHtml;
        }
      } catch (err) {
        console.error('Lỗi đăng ký tài khoản cư dân:', err);
        CONFIG.showToast(err.message || 'Đã có lỗi xảy ra phía máy chủ khi đăng ký tài khoản.', 'danger');
        btnReg.disabled = false;
        btnReg.innerHTML = originalBtnHtml;
      }
    });
  }
});
