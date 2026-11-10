<?php
/**
 * ============================================================================
 * API CÔNG KHAI: DỮ LIỆU BỘ LỌC TÌM KIẾM (FILTER OPTIONS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/public/rooms.js và index.js để nạp danh mục và khu vực vào select
 * Phương thức: GET
 * Trả về: Danh sách categories và locations
 */

require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../repositories/category_repository.php';
require_once __DIR__ . '/../../../repositories/location_repository.php';

$catRepo = new CategoryRepository();
$locRepo = new LocationRepository();

$categories = $catRepo->getAll();
$locations = $locRepo->getAll();

jsonResponse(true, 'Lấy danh mục và khu vực thành công.', [
    'categories' => $categories,
    'locations'  => $locations
]);

