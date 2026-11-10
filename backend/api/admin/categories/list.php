<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH LOẠI PHÒNG (CATEGORIES LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/categories.js (Hàm loadCategories())
 * Phương thức: GET
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/category_repository.php';

requireAdmin();

$catRepo = new CategoryRepository();
$categories = $catRepo->getAll();

jsonResponse(true, 'Lấy danh sách loại phòng thành công.', $categories);

