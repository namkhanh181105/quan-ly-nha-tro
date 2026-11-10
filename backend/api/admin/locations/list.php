<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH KHU VỰC (LOCATIONS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/locations.js (Hàm loadLocations())
 * Phương thức: GET
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/location_repository.php';

requireAdmin();

$locRepo = new LocationRepository();
$locations = $locRepo->getAll();

jsonResponse(true, 'Lấy danh sách khu vực thành công.', $locations);

