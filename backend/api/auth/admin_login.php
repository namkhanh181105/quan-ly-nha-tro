<?php
/**
 * ============================================================================
 * API: ĐĂNG NHẬP QUẢN TRỊ VIÊN (ADMIN LOGIN)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/auth.js (Form #adminLoginForm, nút #btnLogin)
 * Phương thức: POST
 * Dữ liệu gửi: username (string), password (string)
 * Kiểm tra: Xác thực tài khoản trong bảng `admins`, so khớp password_verify.
 * Lưu thông tin vào $_SESSION['admin_user'].
 * Trả về: JSON thông tin admin đã đăng nhập.
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../helpers/csrf.php';
require_once __DIR__ . '/../../repositories/admin_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

$input = getRequestData();
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    jsonResponse(false, 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.', null, 400);
}

$adminRepo = new AdminRepository();
$admin = $adminRepo->getByUsername($username);

if (!$admin || !password_verify($password, $admin['password'])) {
    jsonResponse(false, 'Tên đăng nhập hoặc mật khẩu không chính xác.', null, 200);
}

// Cập nhật thời điểm đăng nhập cuối
$adminRepo->updateLastLogin((int)$admin['id']);

// Lưu session an toàn (loại bỏ trường password hash)
unset($admin['password']);
$_SESSION['admin_user'] = [
    'id'         => (int)$admin['id'],
    'username'   => $admin['username'],
    'fullname'   => $admin['fullname'],
    'email'      => $admin['email'],
    'phone'      => $admin['phone'],
    'role'       => $admin['role'],
    'avatar'     => $admin['avatar'] ?? 'default-avatar.png',
    'last_login' => date('Y-m-d H:i:s')
];

// Tạo lại CSRF token sau khi đăng nhập thành công
$newCsrf = regenerateCsrfToken();

jsonResponse(true, 'Đăng nhập thành công.', [
    'admin'      => $_SESSION['admin_user'],
    'csrf_token' => $newCsrf
]);

