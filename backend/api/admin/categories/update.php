<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT LOẠI PHÒNG (UPDATE CATEGORY)
 * ============================================================================
 * Gọi bởi: Form #categoryForm trên frontend/admin/categories.html khi sửa
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/category_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$name = sanitizeText($input['name'] ?? '');
$slug = trim($input['slug'] ?? '');
$description = sanitizeText($input['description'] ?? '');

if ($id <= 0 || empty($name)) {
    jsonResponse(false, 'Mã loại phòng và tên không được để trống.', null, 400);
}

if (empty($slug)) {
    $slug = createSlug($name);
} else {
    $slug = createSlug($slug);
}
// Kiểm tra trùng Slug với loại phòng khác (trừ chính loại phòng đang sửa)
$catRepo = new CategoryRepository();
if ($catRepo->checkSlugExists($slug, $id)) {
    $slug .= '-' . $id;
}
//Gọi hàm cập nhật CSDL:backend/repositories/category_repository.php
$catRepo->update($id, $name, $slug, $description);

jsonResponse(true, 'Cập nhật loại phòng thành công.');

