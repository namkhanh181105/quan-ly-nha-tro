<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA KHU VỰC (DELETE LOCATION)
 * ============================================================================
 * Gọi bởi: Nút xác nhận xóa khu vực trên frontend/admin/locations.html
 * Phương thức: POST
 * Kiểm tra: Chặn xóa nếu còn phòng trọ thuộc khu vực này.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/location_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã khu vực không hợp lệ.', null, 400);
}

$locRepo = new LocationRepository();
$loc = $locRepo->getById($id);

if (!$loc) {
    jsonResponse(false, 'Khu vực không tồn tại.', null, 404);
}

$roomCount = $locRepo->countRooms($id);
if ($roomCount > 0) {
    jsonResponse(false, "Không thể xóa khu vực '{$loc['name']}' vì hiện có {$roomCount} phòng trọ thuộc khu vực này.", null, 400);
}

$locRepo->delete($id);

jsonResponse(true, "Đã xóa khu vực '{$loc['name']}' thành công.");

//. Nếu khu vực bị xóa trong khi các phòng vẫn còn, dữ liệu phòng trọ sẽ bị mất liên kết địa lý hoặc gây lỗi khóa ngoại MySQL