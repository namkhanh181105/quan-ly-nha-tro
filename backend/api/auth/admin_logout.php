<?php
/**
 * ============================================================================
 * API: ĐĂNG XUẤT QUẢN TRỊ VIÊN (ADMIN LOGOUT)
 * ============================================================================
 * Gọi bởi: Nút #btnLogout trên header/sidebar admin
 * Phương thức: POST
 * Xử lý: Xóa session $_SESSION['admin_user']
 * Trả về: JSON success
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/csrf.php';

unset($_SESSION['admin_user']);
regenerateCsrfToken();

jsonResponse(true, 'Đã đăng xuất tài khoản quản trị thành công.');

