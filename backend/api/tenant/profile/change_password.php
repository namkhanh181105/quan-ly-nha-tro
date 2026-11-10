<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: ĐỔI MẬT KHẨU (CHANGE TENANT PASSWORD)
 * ============================================================================
 * Gọi bởi: Form #tenantPasswordForm trên frontend/tenant/profile.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

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

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($tenantId);

if (!$tenant || !password_verify($currentPassword, $tenant['password'])) {
    jsonResponse(false, 'Mật khẩu hiện tại không chính xác.', null, 400);
}

$newHash = password_hash($newPassword, PASSWORD_BCRYPT);
$tenantRepo->resetPassword($tenantId, $newHash);

jsonResponse(true, 'Đổi mật khẩu Cổng cư dân thành công!');

