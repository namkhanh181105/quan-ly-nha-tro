<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CHI TIẾT KHU VỰC (LOCATION DETAIL)
 * ============================================================================
 * Gọi bởi: Modal sửa khu vực trên frontend/admin/locations.html
 * Phương thức: GET
 * Tham số: id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/location_repository.php';

requireAdmin();

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã khu vực không hợp lệ.', null, 400);
}

$locRepo = new LocationRepository(); //gọi LocationRepository::getById($id) để chạy SQL
$loc = $locRepo->getById($id);

if (!$loc) {
    jsonResponse(false, 'Không tìm thấy khu vực.', null, 404);
}

jsonResponse(true, 'Lấy chi tiết khu vực thành công.', $loc);

