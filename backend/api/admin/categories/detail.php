<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CHI TIẾT LOẠI PHÒNG (CATEGORY DETAIL)
 * ============================================================================
 * Gọi bởi: Modal sửa loại phòng trên frontend/admin/categories.html
 * Phương thức: GET
 * Tham số: id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/category_repository.php';

requireAdmin(); //Kiểm tra quyền quản trị.

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã loại phòng không hợp lệ.', null, 400);
}
//Truy vấn dữ liệu từ CSDL MySQL backend/repositories/category_repository.php
$catRepo = new CategoryRepository();
$category = $catRepo->getById($id);  

if (!$category) {
    jsonResponse(false, 'Không tìm thấy loại phòng.', null, 404);
}

jsonResponse(true, 'Lấy chi tiết loại phòng thành công.', $category);

