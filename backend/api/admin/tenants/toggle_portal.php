<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: KHÓA / MỞ KHÓA TÀI KHOẢN CỔNG CƯ DÂN (TOGGLE PORTAL)
 * ============================================================================
 * Gọi bởi: Nút chuyển đổi portal_status trên frontend/admin/tenants.html
 * Phương thức: POST
 * Dữ liệu gửi: id (int), status (0 hoặc 1)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$newStatus = isset($input['status']) ? (int)$input['status'] : 1;

if ($id <= 0) {
    jsonResponse(false, 'Mã người thuê không hợp lệ.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($id);
if (!$tenant) {
    jsonResponse(false, 'Hồ sơ người thuê không tồn tại.', null, 404);
}
//truy vấn sql togglePortalStatus
$tenantRepo->togglePortalStatus($id, $newStatus);
$label = ($newStatus === 1) ? 'Mở khóa' : 'Khóa';

jsonResponse(true, "Đã {$label} tài khoản Cổng cư dân của {$tenant['fullname']}.");

