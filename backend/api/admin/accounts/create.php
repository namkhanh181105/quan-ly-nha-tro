<?php
/**
 * ============================================================================
 * API SUPERADMIN: TẠO TÀI KHOẢN QUẢN TRỊ MỚI (CREATE ADMIN ACCOUNT)
 * ============================================================================
 * Gọi bởi: Modal #accountModal trên frontend/admin/accounts.html
 * Phương thức: POST
 * Phân quyền: requireSuperAdmin()
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/admin_repository.php';

requireSuperAdmin();
verifyCsrfToken();

$input = getRequestData();
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$fullname = sanitizeText($input['fullname'] ?? '');
$email = sanitizeText($input['email'] ?? '');
$phone = sanitizeText($input['phone'] ?? '');
$role = trim($input['role'] ?? 'admin');

if (empty($username) || empty($password) || empty($fullname) || empty($email)) {
    jsonResponse(false, 'Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu, họ tên và email.', null, 400);
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Email không đúng định dạng.', null, 400);
}

if (!isValidEnum($role, ['superadmin', 'admin'])) {
    $role = 'admin';
}

$adminRepo = new AdminRepository();
if ($adminRepo->checkUsernameExists($username)) {
    jsonResponse(false, "Tên đăng nhập '{$username}' đã được sử dụng.", null, 400);
}
if ($adminRepo->checkEmailExists($email)) {
    jsonResponse(false, "Email '{$email}' đã được sử dụng.", null, 400);
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$adminId = $adminRepo->create([
    'username' => $username,
    'password' => $hash,
    'fullname' => $fullname,
    'email'    => $email,
    'phone'    => $phone,
    'role'     => $role,
    'avatar'   => 'default-avatar.png'
]);

jsonResponse(true, "Tạo tài khoản quản trị '{$username}' thành công.", ['admin_id' => $adminId], 201);

