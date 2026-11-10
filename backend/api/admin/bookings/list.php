<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH LỊCH HẸN XEM PHÒNG (ADMIN BOOKINGS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/bookings.js (Hàm loadBookings(), bộ lọc #bookingFilterForm)
 * Phương thức: GET
 * Tham số lọc: keyword, status, room_id, page, limit
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/booking_repository.php';

requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword' => $_GET['keyword'] ?? '',
    'status'  => $_GET['status'] ?? '',
    'room_id' => $_GET['room_id'] ?? ''
];

$bookingRepo = new BookingRepository();
$items = $bookingRepo->getBookings($filters, $limit, $offset);
$total = $bookingRepo->countBookings($filters);

jsonResponse(true, 'Lấy danh sách lịch hẹn thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

