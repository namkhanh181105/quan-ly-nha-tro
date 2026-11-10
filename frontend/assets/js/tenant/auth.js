/**
 * ==============================================================================
 * JAVASCRIPT XÁC THỰC CƯ DÂN (TENANT PORTAL AUTHENTICATION)
 * ==============================================================================
 * File: frontend/assets/js/tenant/auth.js
 * Nhiệm vụ:
 * 1. Bắt sự kiện submit form đăng nhập cư dân #tenantLoginForm:
 *    - Thu thập email và mật khẩu.
 *    - Gọi POST backend/api/auth/tenant_login.php
 *    - Phía backend kiểm tra tài khoản, bcrypt password và portal_status == 1.
 * 2. Xử lý phản hồi JSON:
 *    - Nếu thành công: hiển thị Toast và chuyển hướng tới frontend/tenant/dashboard.html
 *    - Nếu thất bại: hiển thị Toast lỗi tương ứng.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('tenantLoginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btnLogin = document.getElementById('btnTenantLogin');
    const originalBtnHtml = btnLogin.innerHTML;

    const loginInputEl = document.getElementById('tenantLoginInput') || document.getElementById('tenantEmail');
    const loginVal = loginInputEl ? loginInputEl.value.trim() : '';
    const password = document.getElementById('tenantPassword').value;

    if (!loginVal || !password) {
      Utils.showToast('Vui lòng nhập số điện thoại hoặc email và mật khẩu!', 'warning');
      return;
    }

    try {
      btnLogin.disabled = true;
      btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xác thực...';

      const res = await API.post('/auth/tenant_login.php', {
        login: loginVal,
        password: password
      });

      if (res.success) {
        Utils.showToast(res.message || 'Đăng nhập thành công! Đang vào hệ thống...', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      } else {
        Utils.showToast(res.message || 'Số điện thoại/Email hoặc mật khẩu không chính xác hoặc tài khoản đang bị khóa!', 'danger');
        btnLogin.disabled = false;
        btnLogin.innerHTML = originalBtnHtml;
      }
    } catch (err) {
      console.error('Lỗi đăng nhập cư dân:', err);
      Utils.showToast(err.message || 'Không thể kết nối máy chủ xác thực. Vui lòng thử lại sau!', 'danger');
      btnLogin.disabled = false;
      btnLogin.innerHTML = originalBtnHtml;
    }
  });
});

