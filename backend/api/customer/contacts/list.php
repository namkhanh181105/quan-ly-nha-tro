<?php
/**
 * ============================================================================
 * API KHÁCH HÀNG: TIN NHẮN LIÊN HỆ CỦA TÔI (MY CONTACTS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/customer/bookings.js (Tab Tin nhắn liên hệ)
 * Phương thức: GET
 * Nghiệp vụ: Lấy tin nhắn liên hệ lọc theo user_id lưu trong Session.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/contact_repository.php';

$sessionUser = requireUser();
$userId = (int)$sessionUser['id'];

$contactRepo = new ContactRepository();
$contacts = $contactRepo->getByUserId($userId);

jsonResponse(true, 'Lấy danh sách tin nhắn liên hệ thành công.', $contacts);

