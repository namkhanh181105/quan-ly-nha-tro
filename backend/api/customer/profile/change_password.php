<?php
/**
 * ============================================================================
 * API KHÁCH HÀNG: ĐỔI MẬT KHẨU (CHANGE PASSWORD)
 * ============================================================================
 * Gọi bởi: Form #passwordForm trên frontend/customer/profile.html
 * Phương thức: POST
 * Dữ liệu gửi: current_password, new_password, confirm_password
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../repositories/user_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionUser = requireUser();
$userId = (int)$sessionUser['id'];

$input = getRequestData();
$currentPassword = trim($input['current_password'] ?? '');
$newPassword = trim($input['new_password'] ?? '');
$confirmPassword = trim($input['confirm_password'] ?? '');

if (empty($currentPassword) || empty($newPassword)) {
    jsonResponse(false, 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.', null, 400);
}

if ($newPassword !== $confirmPassword) {
    jsonResponse(false, 'Mật khẩu xác nhận không khớp.', null, 400);
}

if (strlen($newPassword) < 6) {
    jsonResponse(false, 'Mật khẩu mới phải có ít nhất 6 ký tự.', null, 400);
}

$userRepo = new UserRepository();
$user = $userRepo->getByPhone($sessionUser['phone']) ?? $userRepo->getByEmail($sessionUser['email'] ?? '');

if (!$user || !password_verify($currentPassword, $user['password'])) {
    jsonResponse(false, 'Mật khẩu hiện tại không chính xác.', null, 400);
}

$newHash = password_hash($newPassword, PASSWORD_BCRYPT);
$userRepo->changePassword($userId, $newHash);

jsonResponse(true, 'Đổi mật khẩu thành công!');

