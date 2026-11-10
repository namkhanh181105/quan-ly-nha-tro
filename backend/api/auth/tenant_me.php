<?php
/**
 * ============================================================================
 * API: LẤY THÔNG TIN CƯ DÂN HIỆN TẠI (TENANT ME)
 * ============================================================================
 * Gọi bởi: Header/sidebar cư dân để hiển thị tên, phòng đang thuê và ảnh đại diện
 * Phương thức: GET
 * Trả về: JSON thông tin chi tiết cư dân từ database mới nhất
 */

require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../repositories/tenant_repository.php';

$sessionTenant = requireTenant();

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById((int)$sessionTenant['id']);

if (!$tenant) {
    unset($_SESSION['tenant_user']);
    jsonResponse(false, 'Hồ sơ cư dân không tồn tại.', null, 404);
}

unset($tenant['password']);
// Đồng bộ lại session
$_SESSION['tenant_user'] = $tenant;

jsonResponse(true, 'Lấy thông tin cư dân thành công.', $tenant);

