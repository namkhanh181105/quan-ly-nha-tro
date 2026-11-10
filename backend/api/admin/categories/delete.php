<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA LOẠI PHÒNG (DELETE CATEGORY)
 * ============================================================================
 * Gọi bởi: Nút xác nhận xóa loại phòng trên frontend/admin/categories.html
 * Phương thức: POST
 * Kiểm tra: Chặn xóa nếu còn phòng trọ thuộc loại phòng này.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/category_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã loại phòng không hợp lệ.', null, 400);
}

$catRepo = new CategoryRepository();
$category = $catRepo->getById($id);  //Lấy thông tin từ bảng categories để đảm bảo bản ghi này đang thực sự tồn tại trong CSDL.

if (!$category) {
    jsonResponse(false, 'Loại phòng không tồn tại.', null, 404);
}

$roomCount = $catRepo->countRooms($id);
if ($roomCount > 0) {
    jsonResponse(false, "Không thể xóa loại phòng '{$category['name']}' vì hiện có {$roomCount} phòng trọ đang thuộc loại này.", null, 400);
}

$catRepo->delete($id);

jsonResponse(true, "Đã xóa loại phòng '{$category['name']}' thành công.");

