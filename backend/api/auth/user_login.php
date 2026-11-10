<?php
/**
 * ============================================================================
 * API: ĐĂNG NHẬP KHÁCH HÀNG (CUSTOMER USER LOGIN)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/public/auth.js (Form #loginForm, nút #btnLogin)
 * Phương thức: POST
 * Dữ liệu gửi: login (số điện thoại hoặc email), password (string)
 * Kiểm tra: Bảng `users`, so khớp password_verify, kiểm tra status == 'active'.
 * Lưu thông tin vào $_SESSION['customer_user'].
 * Trả về: JSON thông tin khách hàng.
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../helpers/csrf.php';
require_once __DIR__ . '/../../repositories/user_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

$input = getRequestData();
$login = trim($input['login'] ?? $input['username'] ?? $input['email'] ?? $input['phone'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($login) || empty($password)) {
    jsonResponse(false, 'Vui lòng nhập số điện thoại hoặc email và mật khẩu.', null, 200);
}

$userRepo = new UserRepository();
$user = $userRepo->findByPhoneOrEmail($login);

if (!$user || !password_verify($password, $user['password'])) {
    jsonResponse(false, 'Số điện thoại/email hoặc mật khẩu không chính xác.', null, 200);
}

if ($user['status'] === 'locked') {
    jsonResponse(false, 'Tài khoản khách hàng của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.', null, 200);
}

$userRepo->updateLastLogin((int)$user['id']);

unset($user['password']);
$_SESSION['customer_user'] = [
    'id'         => (int)$user['id'],
    'fullname'   => $user['fullname'],
    'phone'      => $user['phone'],
    'email'      => $user['email'],
    'status'     => $user['status'],
    'last_login' => date('Y-m-d H:i:s')
];

$newCsrf = regenerateCsrfToken();

jsonResponse(true, 'Đăng nhập tài khoản khách hàng thành công.', [
    'user'       => $_SESSION['customer_user'],
    'csrf_token' => $newCsrf
]);

