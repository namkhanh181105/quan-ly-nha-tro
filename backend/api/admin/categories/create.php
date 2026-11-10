<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: THÊM LOẠI PHÒNG (CREATE CATEGORY)
 * ============================================================================
 * Gọi bởi: Form #categoryForm trên frontend/admin/categories.html (Nút #btnSaveCategory)
 * Phương thức: POST
 * Dữ liệu gửi: name (string), slug (string, tùy chọn), description (string, tùy chọn)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/category_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$name = sanitizeText($input['name'] ?? '');
$slug = trim($input['slug'] ?? '');
$description = sanitizeText($input['description'] ?? '');

if (empty($name)) {
    jsonResponse(false, 'Tên loại phòng không được để trống.', null, 400);
}

if (empty($slug)) {
    $slug = createSlug($name);
} else {
    $slug = createSlug($slug);
}

$catRepo = new CategoryRepository();
if ($catRepo->checkSlugExists($slug)) {
    $slug .= '-' . time();
}

$catId = $catRepo->create($name, $slug, $description);

jsonResponse(true, 'Thêm loại phòng mới thành công.', ['category_id' => $catId], 201);

