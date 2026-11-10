/**
 * ============================================================================
 * JAVASCRIPT XÁC THỰC QUẢN TRỊ VIÊN (ADMIN AUTH JS)
 * ============================================================================
 * Xử lý đăng nhập tài khoản quản trị từ frontend/admin/login.html:
 * - Bắt sự kiện submit form #adminLoginForm
 * - Gửi POST backend/api/auth/admin_login.php
 * - Thành công: Lưu phiên session an toàn, chuyển hướng sang dashboard.html
 * - Thất bại: Hiển thị toast lỗi và làm nổi bật ô nhập
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('adminLoginForm');
  const btnLogin = document.getElementById('btnLogin');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!username || !password) {
        CONFIG.showToast('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.', 'warning');
        return;
      }

      try {
        const res = await API.post('/auth/admin_login.php', { username, password }, { buttonToDisable: btnLogin });
        if (res && res.success) {
          CONFIG.showToast('Đăng nhập thành công! Đang chuyển hướng...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        } else {
          CONFIG.showToast(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.', 'error');
        }
      } catch (error) {
        CONFIG.showToast('Lỗi kết nối máy chủ khi đăng nhập.', 'error');
      }
    });
  }
});

