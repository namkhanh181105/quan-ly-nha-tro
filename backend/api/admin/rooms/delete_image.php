<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA ẢNH BỘ SƯU TẬP (DELETE ROOM IMAGE)
 * ============================================================================
 * Gọi bởi: Nút xóa ảnh trong modal #roomGalleryModal trên frontend/admin/rooms.html
 * Phương thức: POST
 * Dữ liệu gửi: image_id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$imageId = (int)($input['image_id'] ?? 0);

if ($imageId <= 0) {
    jsonResponse(false, 'Mã ảnh không hợp lệ.', null, 400);
}

$roomRepo = new RoomRepository();
$roomRepo->deleteRoomImage($imageId);

jsonResponse(true, 'Đã xóa ảnh khỏi bộ sưu tập.');

