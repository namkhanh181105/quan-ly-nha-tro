<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CHI TIẾT PHÒNG TRỌ (ADMIN ROOM DETAIL)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/rooms.js (Hàm openEditModal(roomId), viewGallery(roomId))
 * Phương thức: GET
 * Tham số đầu vào: id (int)
 * Kiểm tra: requireAdmin()
 * Gọi: RoomRepository::getRoomById(), RoomRepository::getRoomImages()
 * Trả về JSON:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {
 *     "room": { ... },
 *     "images": [ ... ]
 *   }
 * }
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin(); //chặn nếu chưa đăng nhập hoặc không phải admin

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã phòng không hợp lệ.', null, 400);
}

$roomRepo = new RoomRepository();
$room = $roomRepo->getRoomById($id); //gọi hàm truy vấn CSDL backend/repositories/room_repository.php

if (!$room) {
    jsonResponse(false, 'Không tìm thấy thông tin phòng.', null, 404);
}

$images = $roomRepo->getRoomImages($id);
// Trả kết quả thành công dưới dạng JSON về cho Frontend
jsonResponse(true, 'Lấy chi tiết phòng thành công.', [
    'room'   => $room,
    'images' => $images
]);

