<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CHI TIẾT CƯ DÂN (TENANT DETAIL)
 * ============================================================================
 * Gọi bởi: Modal sửa cư dân và modal xem hợp đồng trên frontend/admin/tenants.html
 * Phương thức: GET
 * Tham số: id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

requireAdmin();

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã người thuê không hợp lệ.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($id);

if (!$tenant) {
    jsonResponse(false, 'Không tìm thấy hồ sơ người thuê.', null, 404);
}

unset($tenant['password']);
jsonResponse(true, 'Lấy chi tiết người thuê thành công.', $tenant);

