<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: ĐẶT LẠI MẬT KHẨU CƯ DÂN (RESET TENANT PASSWORD)
 * ============================================================================
 * Gọi bởi: Modal đặt lại mật khẩu trên frontend/admin/tenants.html
 * Phương thức: POST
 * Dữ liệu gửi: id (int), new_password (string, mặc định 'tenant123' nếu để trống)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$newPassword = trim($input['new_password'] ?? 'tenant123');

if ($id <= 0) {
    jsonResponse(false, 'Mã người thuê không hợp lệ.', null, 400);
}

if (strlen($newPassword) < 6) {
    jsonResponse(false, 'Mật khẩu mới phải từ 6 ký tự trở lên.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($id);
if (!$tenant) {
    jsonResponse(false, 'Hồ sơ người thuê không tồn tại.', null, 404);
}

$hash = password_hash($newPassword, PASSWORD_BCRYPT);
$tenantRepo->resetPassword($id, $hash);

jsonResponse(true, "Đã cấp lại mật khẩu mới cho cư dân {$tenant['fullname']}: '{$newPassword}'.");

