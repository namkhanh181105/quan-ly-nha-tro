<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: LẤY HỒ SƠ CƯ DÂN (GET TENANT PROFILE)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/profile.js (Hàm loadProfile())
 * Phương thức: GET
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

$sessionTenant = requireTenant();
$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById((int)$sessionTenant['id']);

if (!$tenant) {
    jsonResponse(false, 'Hồ sơ cư dân không tồn tại.', null, 404);
}

unset($tenant['password']);
jsonResponse(true, 'Lấy thông tin hồ sơ thành công.', $tenant);

