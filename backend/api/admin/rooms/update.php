<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT PHÒNG TRỌ (ADMIN UPDATE ROOM)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/rooms.js (Form #roomForm khi sửa phòng)
 * Phương thức: POST (FormData)
 * Tham số đầu vào:
 * - id: ID phòng (bắt buộc)
 * - title, floor, room_number, category_id, location_id, address, price, area,
 *   electricity_price, water_price, max_occupants, status, amenities, description
 * - image: File ảnh mới (nếu muốn thay thế ảnh đại diện)
 * Kiểm tra:
 * - requireAdmin()
 * - verifyCsrfToken()
 * - Kiểm tra trùng room_number ngoại trừ chính phòng đang sửa
 * Gọi: RoomRepository::updateRoom()
 * Trả về JSON: { "success": true, "message": "..." }
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../helpers/upload.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin();
verifyCsrfToken();

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã phòng không hợp lệ.', null, 400);
}

$roomRepo = new RoomRepository();
$currentRoom = $roomRepo->getRoomById($id);
if (!$currentRoom) {
    jsonResponse(false, 'Phòng này không tồn tại trong hệ thống.', null, 404);
}

$title = sanitizeText($_POST['title'] ?? '');
$floor = (int)($_POST['floor'] ?? 1);
$roomNumber = trim($_POST['room_number'] ?? '');
$categoryId = (int)($_POST['category_id'] ?? 0);
$locationId = (int)($_POST['location_id'] ?? 0);
$address = sanitizeText($_POST['address'] ?? '');
$price = (float)($_POST['price'] ?? 0);
$area = (float)($_POST['area'] ?? 0);
$elecPrice = (float)($_POST['electricity_price'] ?? 3800);
$waterPrice = (float)($_POST['water_price'] ?? 30000);
$maxOccupants = (int)($_POST['max_occupants'] ?? 2);
$status = trim($_POST['status'] ?? 'available');
$amenities = sanitizeText($_POST['amenities'] ?? '');
$description = sanitizeHtml($_POST['description'] ?? '');

if (empty($title) || empty($roomNumber) || empty($address)) {
    jsonResponse(false, 'Vui lòng nhập đầy đủ tiêu đề, số phòng và địa chỉ.', null, 400);
}
if ($categoryId <= 0 || $locationId <= 0) {
    jsonResponse(false, 'Vui lòng chọn loại phòng và khu vực.', null, 400);
}
if ($price <= 0 || $area <= 0) {
    jsonResponse(false, 'Giá thuê và diện tích phải lớn hơn 0.', null, 400);
}
if (!isValidEnum($status, ['available', 'rented', 'maintenance'])) {
    $status = 'available';
}

// Kiểm tra trùng số phòng
if ($roomRepo->checkRoomNumberExists($roomNumber, $id)) {
    jsonResponse(false, "Số phòng '{$roomNumber}' đã được dùng bởi phòng khác.", null, 400);
}

// Tạo slug mới nếu tiêu đề thay đổi
$slug = ($title !== $currentRoom['title']) 
    ? createSlug($title) . '-' . $id 
    : $currentRoom['slug'];

$data = [
    'title'             => $title,
    'floor'             => $floor,
    'room_number'       => $roomNumber,
    'slug'              => $slug,
    'category_id'       => $categoryId,
    'location_id'       => $locationId,
    'address'           => $address,
    'price'             => $price,
    'area'              => $area,
    'electricity_price' => $elecPrice,
    'water_price'       => $waterPrice,
    'max_occupants'     => $maxOccupants,
    'description'       => $description,
    'amenities'         => $amenities,
    'status'            => $status
];

// Nếu có tải ảnh mới
if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadRes = handleFileUpload(
        $_FILES['image'],
        UPLOADS_PATH . DIRECTORY_SEPARATOR . 'rooms',
        ['image/jpeg', 'image/png', 'image/webp'],
        ['jpg', 'jpeg', 'png', 'webp'],
        5242880
    );

    if (!$uploadRes['success']) {
        jsonResponse(false, 'Lỗi tải ảnh mới: ' . $uploadRes['message'], null, 400);
    }
    $data['image'] = $uploadRes['filename'];
}
//Gửi mảng dữ liệu sang tầng Repository để cập nhật vào CSDL backend/repositories/room_repository.php
$roomRepo->updateRoom($id, $data);

jsonResponse(true, 'Cập nhật thông tin phòng thành công!');

