<?php
/**
 * ============================================================================
 * API: ĐĂNG XUẤT TÀI KHOẢN KHÁCH HÀNG (CUSTOMER USER LOGOUT)
 * ============================================================================
 * Gọi bởi: Nút #btnCustomerLogout trên menu điều hướng
 * Phương thức: POST
 * Xử lý: Xóa session $_SESSION['customer_user']
 * Trả về: JSON success
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/csrf.php';

unset($_SESSION['customer_user']);
regenerateCsrfToken();

jsonResponse(true, 'Đã đăng xuất tài khoản khách hàng thành công.');

