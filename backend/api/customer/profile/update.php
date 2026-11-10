<?php
/**
 * ============================================================================
 * API KHÁCH HÀNG: CẬP NHẬT HỒ SƠ (UPDATE PROFILE)
 * ============================================================================
 * Gọi bởi: Form #profileForm trên frontend/customer/profile.html
 * Phương thức: POST
 * Dữ liệu gửi: fullname (string), email (string)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/user_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionUser = requireUser();
$userId = (int)$sessionUser['id'];

$input = getRequestData();
$fullname = sanitizeText($input['fullname'] ?? '');
$email = sanitizeText($input['email'] ?? '');

if (empty($fullname)) {
    jsonResponse(false, 'Họ tên không được để trống.', null, 400);
}

if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Email không đúng định dạng.', null, 400);
}

$userRepo = new UserRepository();
if (!empty($email) && $userRepo->checkEmailExists($email, $userId)) {
    jsonResponse(false, 'Email này đã được sử dụng bởi tài khoản khác.', null, 400);
}

$userRepo->updateProfile($userId, $fullname, !empty($email) ? $email : null);

$_SESSION['customer_user']['fullname'] = $fullname;
$_SESSION['customer_user']['email'] = $email;

jsonResponse(true, 'Cập nhật thông tin hồ sơ thành công.', [
    'user' => $_SESSION['customer_user']
]);

