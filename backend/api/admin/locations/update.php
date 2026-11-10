<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT KHU VỰC (UPDATE LOCATION)
 * ============================================================================
 * Gọi bởi: Form #locationForm khi sửa
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/location_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$name = sanitizeText($input['name'] ?? '');
$slug = trim($input['slug'] ?? '');
$city = sanitizeText($input['city'] ?? 'Hà Nội');

if ($id <= 0 || empty($name)) {
    jsonResponse(false, 'Mã khu vực và tên không được để trống.', null, 400);
}

if (empty($slug)) {
    $slug = createSlug($name);
} else {
    $slug = createSlug($slug);
}

$locRepo = new LocationRepository();
if ($locRepo->checkSlugExists($slug, $id)) {
    $slug .= '-' . $id;
}

$locRepo->update($id, $name, $slug, $city);

jsonResponse(true, 'Cập nhật khu vực thành công.');

