<?php
/**
 * ============================================================================
 * API CÔNG KHAI: DANH SÁCH PHÒNG TRỌ (PUBLIC ROOMS LIST)
 * ============================================================================
 * Gọi bởi: 
 * - frontend/assets/js/public/rooms.js (Hàm loadRooms(), bộ lọc #roomFilterForm)
 * - frontend/assets/js/public/home.js (Phòng nổi bật trên trang chủ)
 * Phương thức: GET
 * Tham số đầu vào (Query String):
 * - keyword: từ khóa tìm kiếm (tiêu đề, số phòng, địa chỉ)
 * - category_id: ID danh mục loại phòng
 * - location_id: ID khu vực
 * - floor: số tầng (1 - 6)
 * - min_price, max_price: khoảng giá thuê
 * - status: trạng thái (mặc định lấy tất cả hoặc 'available')
 * - sort: 'newest', 'price_asc', 'price_desc', 'views_desc', 'area_desc'
 * - page: trang hiện tại (mặc định 1)
 * - limit: số bản ghi / trang (mặc định 9)
 * Trả về JSON:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {
 *      "items": [...],
 *      "pagination": { "page": 1, "limit": 9, "total": 24, "total_pages": 3 }
 *   }
 * }
 */

require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 9)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword'     => $_GET['keyword'] ?? '',
    'category_id' => $_GET['category_id'] ?? '',
    'location_id' => $_GET['location_id'] ?? '',
    'floor'       => $_GET['floor'] ?? '',
    'min_price'   => $_GET['min_price'] ?? '',
    'max_price'   => $_GET['max_price'] ?? '',
    'status'      => $_GET['status'] ?? ''
];

$sort = $_GET['sort'] ?? 'newest';

$roomRepo = new RoomRepository();
$items = $roomRepo->getRooms($filters, $sort, $limit, $offset);
$total = $roomRepo->countRooms($filters);

jsonResponse(true, 'Lấy danh sách phòng thành công.', [
    'items'      => $items,
    'rooms'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

