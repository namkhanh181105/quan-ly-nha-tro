<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH PHÒNG TRỌ (ADMIN ROOMS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/rooms.js (Hàm loadRooms(), Form lọc #roomFilterForm)
 * Phương thức: GET
 * Tham số đầu vào:
 * - keyword: Tìm theo tiêu đề, số phòng, địa chỉ
 * - category_id: Lọc theo loại phòng
 * - location_id: Lọc theo khu vực
 * - floor: Lọc theo tầng
 * - status: Lọc theo trạng thái ('available', 'rented', 'maintenance')
 * - page: Trang hiện tại (mặc định 1)
 * - limit: Số phòng trên mỗi trang (mặc định 10)
 * Kiểm tra: requireAdmin()
 * Gọi: RoomRepository::getRooms(), RoomRepository::countRooms()
 * Trả về JSON:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {
 *     "items": [...],
 *     "pagination": { "page": 1, "limit": 10, "total": 24, "total_pages": 3 }
 *   }
 * }
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

// Kiểm tra quyền quản trị viên
requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword'     => $_GET['keyword'] ?? '',
    'category_id' => $_GET['category_id'] ?? '',
    'location_id' => $_GET['location_id'] ?? '',
    'floor'       => $_GET['floor'] ?? '',
    'status'      => $_GET['status'] ?? '',
    'min_price'   => $_GET['min_price'] ?? '',
    'max_price'   => $_GET['max_price'] ?? ''
];

$roomRepo = new RoomRepository();
$items = $roomRepo->getRooms($filters, 'newest', $limit, $offset);
$total = $roomRepo->countRooms($filters);

jsonResponse(true, 'Lấy danh sách phòng thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

