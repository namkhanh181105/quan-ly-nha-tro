<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: TẢI ẢNH BỘ SƯU TẬP PHÒNG (UPLOAD ROOM GALLERY IMAGE)
 * ============================================================================
 * Gọi bởi: Modal quản lý ảnh phòng #roomGalleryModal trên frontend/admin/rooms.html
 * Phương thức: POST (FormData)
 * Tham số: room_id (int), gallery_image (file), caption (string)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/upload.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin();
verifyCsrfToken();

$roomId = (int)($_POST['room_id'] ?? 0);
$caption = sanitizeText($_POST['caption'] ?? '');

if ($roomId <= 0) {
    jsonResponse(false, 'Mã phòng không hợp lệ.', null, 400);
}

if (empty($_FILES['gallery_image']) || $_FILES['gallery_image']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(false, 'Vui lòng chọn tệp ảnh để tải lên.', null, 400);
}

$roomRepo = new RoomRepository();
$room = $roomRepo->getRoomById($roomId);
if (!$room) {
    jsonResponse(false, 'Phòng không tồn tại.', null, 404);
}

$uploadRes = handleFileUpload(
    $_FILES['gallery_image'],
    UPLOADS_PATH . DIRECTORY_SEPARATOR . 'rooms',
    ['image/jpeg', 'image/png', 'image/webp'],
    ['jpg', 'jpeg', 'png', 'webp'],
    5242880
);

if (!$uploadRes['success']) {
    jsonResponse(false, 'Lỗi tải ảnh: ' . $uploadRes['message'], null, 400);
}

$imageId = $roomRepo->addRoomImage($roomId, $uploadRes['filename'], $caption);

jsonResponse(true, 'Thêm ảnh vào bộ sưu tập thành công.', [
    'image_id'  => $imageId,
    'image_url' => $uploadRes['filename'],
    'caption'   => $caption
], 201);

