<?php
/**
 * ============================================================================
 * API CÔNG KHAI: GỬI TIN NHẮN LIÊN HỆ (CREATE CONTACT MESSAGE)
 * ============================================================================
 * Gọi bởi: Form #contactForm trên frontend/public/contact.html
 * Phương thức: POST
 * Dữ liệu gửi:
 * - fullname (string, bắt buộc)
 * - phone (string, bắt buộc)
 * - email (string, tùy chọn)
 * - subject (string, tùy chọn)
 * - message (string, bắt buộc)
 * Ghi chú: Tự động gán user_id từ Session nếu khách hàng đã đăng nhập.
 * Trả về: JSON thông báo thành công.
 */

require_once __DIR__ . '/../../../config/app.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/contact_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

$input = getRequestData();
$name = sanitizeText($input['fullname'] ?? $input['name'] ?? '');
$phone = sanitizeText($input['phone'] ?? '');
$email = sanitizeText($input['email'] ?? '');
$subject = sanitizeText($input['subject'] ?? 'Tư vấn thuê phòng');
$message = sanitizeText($input['message'] ?? '');

if (empty($name) || empty($phone) || empty($message)) {
    jsonResponse(false, 'Vui lòng nhập họ tên, số điện thoại và nội dung tin nhắn.', null, 400);
}
if (!isValidPhone($phone)) {
    jsonResponse(false, 'Số điện thoại không hợp lệ (yêu cầu 10 số).', null, 400);
}
if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Định dạng email không hợp lệ.', null, 400);
}

$currentUser = getCurrentUser();
$userId = $currentUser ? (int)$currentUser['id'] : null;

$contactRepo = new ContactRepository();
$contactId = $contactRepo->create([
    'fullname' => $name,
    'phone'    => $phone,
    'email'    => !empty($email) ? $email : null,
    'subject'  => $subject,
    'message'  => $message,
    'status'   => 'new',
    'user_id'  => $userId
]);

jsonResponse(true, 'Gửi tin nhắn liên hệ thành công. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!', [
    'contact_id' => $contactId
], 201);

