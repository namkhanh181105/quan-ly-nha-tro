<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT TRẠNG THÁI LỊCH HẸN (UPDATE BOOKING STATUS)
 * ============================================================================
 * Gọi bởi: Modal xử lý lịch hẹn trên frontend/admin/bookings.html
 * Phương thức: POST
 * Dữ liệu gửi:
 * - id: ID lịch hẹn
 * - status: 'pending', 'contacted', 'approved', 'cancelled'
 * - note: Ghi chú trao đổi với khách
 * LƯU Ý QUAN TRỌNG:
 * Duyệt lịch hẹn (status = 'approved') KHÔNG tự động chuyển trạng thái phòng sang 'rented'.
 * Phòng chỉ chuyển sang 'rented' khi chính thức lập hợp đồng thuê trong phân hệ Người thuê.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/booking_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$status = trim($input['status'] ?? '');
$note = sanitizeText($input['note'] ?? '');

if ($id <= 0) {
    jsonResponse(false, 'Mã lịch hẹn không hợp lệ.', null, 400);
}

if (!isValidEnum($status, ['pending', 'contacted', 'approved', 'cancelled'])) {
    jsonResponse(false, 'Trạng thái lịch hẹn không hợp lệ.', null, 400);
}

$bookingRepo = new BookingRepository();
$booking = $bookingRepo->getById($id);

if (!$booking) {
    jsonResponse(false, 'Lịch hẹn không tồn tại.', null, 404);
}

$bookingRepo->updateStatus($id, $status, !empty($note) ? $note : null);

jsonResponse(true, 'Cập nhật trạng thái lịch hẹn thành công.');

