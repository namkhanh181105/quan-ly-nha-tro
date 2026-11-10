<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: THÊM KHU VỰC (CREATE LOCATION)
 * ============================================================================
 * Gọi bởi: Form #locationForm trên frontend/admin/locations.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/location_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$name = sanitizeText($input['name'] ?? '');
$slug = trim($input['slug'] ?? '');
$city = sanitizeText($input['city'] ?? 'Hà Nội');

if (empty($name)) {
    jsonResponse(false, 'Tên khu vực không được để trống.', null, 400);
}

if (empty($slug)) {
    $slug = createSlug($name);
} else {
    $slug = createSlug($slug);
}

$locRepo = new LocationRepository();
if ($locRepo->checkSlugExists($slug)) {
    $slug .= '-' . time();
}

$locId = $locRepo->create($name, $slug, $city);

jsonResponse(true, 'Thêm khu vực mới thành công.', ['location_id' => $locId], 201);

