<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: THÊM MỚI PHÒNG TRỌ (ADMIN CREATE ROOM)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/rooms.js (Form #roomForm, nút submit #btnSaveRoom)
 * Phương thức: POST (FormData kèm ảnh đại diện nếu có)
 * Tham số đầu vào:
 * - title: Tiêu đề phòng (bắt buộc)
 * - floor: Số tầng (bắt buộc, 1 - 6)
 * - room_number: Số phòng (bắt buộc, ví dụ: 101, 202)
 * - category_id: ID loại phòng (bắt buộc)
 * - location_id: ID khu vực (bắt buộc)
 * - address: Địa chỉ (bắt buộc)
 * - price: Giá thuê (VNĐ/tháng, bắt buộc >= 0)
 * - area: Diện tích m2 (bắt buộc > 0)
 * - electricity_price: Đơn giá điện (mặc định 3800)
 * - water_price: Đơn giá nước (mặc định 30000)
 * - max_occupants: Sức chứa tối đa (mặc định 2)
 * - status: 'available', 'rented', 'maintenance'
 * - amenities: Danh sách tiện nghi (chuỗi phân cách dấu phẩy)
 * - description: Mô tả chi tiết (HTML đã lọc an toàn)
 * - image: File ảnh đại diện phòng (tùy chọn)
 * Kiểm tra:
 * - requireAdmin()
 * - verifyCsrfToken()
 * - Check trùng room_number
 * - Chống XSS mô tả bằng sanitizeHtml()
 * Gọi: RoomRepository::createRoom()
 * Trả về JSON: { "success": true, "message": "...", "data": { "room_id": ... } }
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../helpers/upload.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin();
verifyCsrfToken();

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

// Kiểm tra tính hợp lệ dữ liệu
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

$roomRepo = new RoomRepository();

// Kiểm tra số phòng đã tồn tại chưa
if ($roomRepo->checkRoomNumberExists($roomNumber)) {
    jsonResponse(false, "Số phòng '{$roomNumber}' đã tồn tại trong hệ thống.", null, 400);
}

// Xử lý tạo slug thân thiện
$slug = createSlug($title) . '-' . time();

// Xử lý upload ảnh đại diện nếu có
$imageFilename = 'default-room.jpg';
if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $uploadRes = handleFileUpload(
        $_FILES['image'],
        UPLOADS_PATH . DIRECTORY_SEPARATOR . 'rooms',
        ['image/jpeg', 'image/png', 'image/webp'],
        ['jpg', 'jpeg', 'png', 'webp'],
        5242880 // 5MB
    );

    if (!$uploadRes['success']) {
        jsonResponse(false, 'Lỗi tải ảnh phòng: ' . $uploadRes['message'], null, 400);
    }
    $imageFilename = $uploadRes['filename'];
}

$roomId = $roomRepo->createRoom([
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
    'image'             => $imageFilename,
    'description'       => $description,
    'amenities'         => $amenities,
    'status'            => $status
]);

jsonResponse(true, 'Thêm phòng trọ mới thành công!', [
    'room_id' => $roomId
], 201);

