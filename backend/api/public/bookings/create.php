<?php
/**
 * ============================================================================
 * API CÔNG KHAI: ĐẶT LỊCH HẸN XEM PHÒNG (CREATE BOOKING)
 * ============================================================================
 * Gọi bởi: 
 * - Modal #bookingModal trên frontend/public/room-detail.html
 * - Nút submit #btnSubmitBooking
 * Phương thức: POST
 * Dữ liệu gửi:
 * - room_id (int, bắt buộc)
 * - customer_name (string, bắt buộc)
 * - customer_phone (string, bắt buộc)
 * - customer_email (string, tùy chọn)
 * - appointment_date (date: Y-m-d, bắt buộc)
 * - note (text, tùy chọn)
 * Ghi chú: Nếu khách hàng đã đăng nhập, tự động liên kết user_id từ Session.
 * Trả về: JSON thông báo đặt lịch thành công.
 */

require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/booking_repository.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

$input = getRequestData();

$roomId = (int)($input['room_id'] ?? 0);
$name = sanitizeText($input['customer_name'] ?? $input['fullname'] ?? $input['name'] ?? '');
$phone = sanitizeText($input['customer_phone'] ?? $input['phone'] ?? '');
$email = sanitizeText($input['customer_email'] ?? $input['email'] ?? '');
$date = trim($input['appointment_date'] ?? $input['booking_date'] ?? $input['date'] ?? '');
$time = trim($input['booking_time'] ?? $input['time'] ?? '');
$note = sanitizeText($input['note'] ?? '');

if (!empty($time)) {
    $note = trim($note . (!empty($note) ? " (Giờ hẹn xem: $time)" : "Giờ hẹn xem phòng: $time"));
}

if ($roomId <= 0) {
    jsonResponse(false, 'Vui lòng chọn phòng cần xem.', null, 400);
}
if (empty($name) || empty($phone) || empty($date)) {
    jsonResponse(false, 'Vui lòng điền họ tên, số điện thoại và ngày hẹn xem phòng.', null, 400);
}
if (!isValidPhone($phone)) {
    jsonResponse(false, 'Số điện thoại không hợp lệ (yêu cầu 10 số).', null, 400);
}
if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Địa chỉ email không đúng định dạng.', null, 400);
}
if (!isValidDate($date, 'Y-m-d')) {
    if (isValidDate($date, 'd/m/Y')) {
        $d = DateTime::createFromFormat('d/m/Y', $date);
        $date = $d ? $d->format('Y-m-d') : $date;
    } else {
        jsonResponse(false, 'Ngày hẹn không hợp lệ (định dạng YYYY-MM-DD).', null, 400);
    }
}

// Kiểm tra phòng có tồn tại không
$roomRepo = new RoomRepository();
$room = $roomRepo->getRoomById($roomId);
if (!$room) {
    jsonResponse(false, 'Phòng này không tồn tại trong hệ thống.', null, 404);
}

// Lấy user_id nếu khách hàng đã đăng nhập tài khoản
$currentUser = getCurrentUser();
$userId = $currentUser ? (int)$currentUser['id'] : null;

$bookingRepo = new BookingRepository();
$bookingId = $bookingRepo->create([
    'room_id'          => $roomId,
    'customer_name'    => $name,
    'customer_phone'   => $phone,
    'customer_email'   => !empty($email) ? $email : null,
    'appointment_date' => $date,
    'note'             => $note,
    'status'           => 'pending',
    'user_id'          => $userId
]);

jsonResponse(true, 'Đặt lịch hẹn xem phòng thành công! Ban quản lý sẽ sớm liên hệ xác nhận với bạn.', [
    'booking_id' => $bookingId
], 201);

