<?php
/**
 * ============================================================================
 * API: ĐĂNG KÝ TÀI KHOẢN KHÁCH HÀNG (CUSTOMER USER REGISTER)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/public/auth.js (Form #registerForm, nút #btnRegister)
 * Phương thức: POST
 * Dữ liệu gửi: fullname (string), phone (string), email (string, optional), password (string)
 * Kiểm tra:
 * - Kiểm tra trùng số điện thoại, trùng email
 * - Hash password bằng BCRYPT
 * - Thêm vào bảng `users` với status = 'active'
 * Trả về: JSON success
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
$fullname = trim($input['fullname'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($fullname) || empty($phone) || empty($password)) {
    jsonResponse(false, 'Họ tên, số điện thoại và mật khẩu là bắt buộc.', null, 400);
}

if (!isValidPhone($phone)) {
    jsonResponse(false, 'Số điện thoại không hợp lệ (yêu cầu 10 số hợp lệ tại Việt Nam).', null, 400);
}

if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Định dạng email không hợp lệ.', null, 400);
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Mật khẩu phải chứa ít nhất 6 ký tự.', null, 400);
}

$userRepo = new UserRepository();

if ($userRepo->checkPhoneExists($phone)) {
    jsonResponse(false, 'Số điện thoại này đã được sử dụng để đăng ký tài khoản.', null, 400);
}

if (!empty($email) && $userRepo->checkEmailExists($email)) {
    jsonResponse(false, 'Email này đã được sử dụng để đăng ký tài khoản.', null, 400);
}

$pwHash = password_hash($password, PASSWORD_BCRYPT);
$userId = $userRepo->create($fullname, $phone, !empty($email) ? $email : null, $pwHash);

// Tự động đăng nhập sau khi đăng ký
$_SESSION['customer_user'] = [
    'id'         => $userId,
    'fullname'   => $fullname,
    'phone'      => $phone,
    'email'      => $email,
    'status'     => 'active',
    'last_login' => date('Y-m-d H:i:s')
];

$newCsrf = regenerateCsrfToken();

jsonResponse(true, 'Đăng ký tài khoản thành công.', [
    'user'       => $_SESSION['customer_user'],
    'csrf_token' => $newCsrf
], 201);

