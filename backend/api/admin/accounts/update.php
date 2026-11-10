<?php
/**
 * ============================================================================
 * API SUPERADMIN: CẬP NHẬT TÀI KHOẢN QUẢN TRỊ (UPDATE ADMIN ACCOUNT)
 * ============================================================================
 * Gọi bởi: Modal #accountModal khi sửa
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
$id = (int)($input['id'] ?? 0);
$fullname = sanitizeText($input['fullname'] ?? '');
$email = sanitizeText($input['email'] ?? '');
$phone = sanitizeText($input['phone'] ?? '');
$role = trim($input['role'] ?? 'admin');
$password = trim($input['password'] ?? '');

if ($id <= 0 || empty($fullname) || empty($email)) {
    jsonResponse(false, 'Mã tài khoản, họ tên và email không được để trống.', null, 400);
}

if (!isValidEmail($email)) {
    jsonResponse(false, 'Email không đúng định dạng.', null, 400);
}

if (!isValidEnum($role, ['superadmin', 'admin'])) {
    $role = 'admin';
}

$adminRepo = new AdminRepository();
$account = $adminRepo->getById($id);
if (!$account) {
    jsonResponse(false, 'Tài khoản không tồn tại.', null, 404);
}

if ($adminRepo->checkEmailExists($email, $id)) {
    jsonResponse(false, "Email '{$email}' đã được dùng bởi tài khoản khác.", null, 400);
}

$data = [
    'fullname' => $fullname,
    'email'    => $email,
    'phone'    => $phone,
    'role'     => $role
];

if (!empty($password)) {
    if (strlen($password) < 6) {
        jsonResponse(false, 'Mật khẩu mới phải từ 6 ký tự trở lên.', null, 400);
    }
    $data['password'] = password_hash($password, PASSWORD_BCRYPT);
}

$adminRepo->update($id, $data);

jsonResponse(true, "Cập nhật tài khoản '{$account['username']}' thành công.");

