<?php
/**
 * ============================================================================
 * API KHÁCH HÀNG: LỊCH HẸN XEM PHÒNG CỦA TÔI (MY BOOKINGS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/customer/bookings.js (Hàm loadMyBookings())
 * Phương thức: GET
 * Nghiệp vụ: Lấy lịch hẹn xem phòng lọc theo user_id lưu trong Session.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/booking_repository.php';

$sessionUser = requireUser();
$userId = (int)$sessionUser['id'];

$bookingRepo = new BookingRepository();
$bookings = $bookingRepo->getByUserId($userId);

jsonResponse(true, 'Lấy lịch hẹn xem phòng thành công.', $bookings);

