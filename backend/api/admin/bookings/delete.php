<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA LỊCH HẸN (DELETE BOOKING)
 * ============================================================================
 * Gọi bởi: Nút xác nhận xóa lịch hẹn trên frontend/admin/bookings.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/booking_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã lịch hẹn không hợp lệ.', null, 400);
}

$bookingRepo = new BookingRepository();
$bookingRepo->delete($id);

jsonResponse(true, 'Đã xóa lịch hẹn thành công.');

