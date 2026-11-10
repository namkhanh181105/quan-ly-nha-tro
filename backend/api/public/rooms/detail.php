<?php
/**
 * ============================================================================
 * API CÔNG KHAI: CHI TIẾT PHÒNG TRỌ (PUBLIC ROOM DETAIL)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/public/room-detail.js (Hàm loadRoomDetail())
 * Phương thức: GET
 * Tham số: id (int) hoặc slug (string)
 * Tự động tăng lượt xem (views) khi người dùng truy cập.
 * Trả về: Thông tin phòng + Danh sách ảnh bộ sưu tập (room_images).
 */

require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;

if (!$id && !$slug) {
    jsonResponse(false, 'Thiếu tham số định danh phòng (id hoặc slug).', null, 400);
}

$roomRepo = new RoomRepository();
$room = $id ? $roomRepo->getRoomById($id) : $roomRepo->getRoomBySlug($slug);

if (!$room) {
    jsonResponse(false, 'Không tìm thấy phòng trọ này trong hệ thống.', null, 404);
}

// Tăng số lượt xem phòng
$roomRepo->incrementViews((int)$room['id']);
$room['views'] = (int)$room['views'] + 1;

// Lấy bộ sưu tập ảnh phòng
$images = $roomRepo->getRoomImages((int)$room['id']);

jsonResponse(true, 'Lấy chi tiết phòng thành công.', [
    'room'   => $room,
    'images' => $images
]);

