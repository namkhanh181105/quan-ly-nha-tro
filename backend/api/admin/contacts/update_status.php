<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT TRẠNG THÁI LIÊN HỆ (UPDATE CONTACT STATUS)
 * ============================================================================
 * Gọi bởi: Modal xử lý liên hệ trên frontend/admin/contacts.html
 * Phương thức: POST
 * Dữ liệu gửi:
 * - id: ID tin nhắn
 * - status: 'new', 'read', 'contacted'
 * - admin_notes: Ghi chú phản hồi
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/contact_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$status = trim($input['status'] ?? '');
$adminNotes = sanitizeText($input['admin_notes'] ?? '');

if ($id <= 0) {
    jsonResponse(false, 'Mã tin nhắn không hợp lệ.', null, 400);
}

if (!isValidEnum($status, ['new', 'read', 'contacted'])) {
    jsonResponse(false, 'Trạng thái không hợp lệ.', null, 400);
}

$contactRepo = new ContactRepository();
$contact = $contactRepo->getById($id);

if (!$contact) {
    jsonResponse(false, 'Tin nhắn liên hệ không tồn tại.', null, 404);
}

$contactRepo->updateStatus($id, $status, !empty($adminNotes) ? $adminNotes : null);

jsonResponse(true, 'Cập nhật trạng thái liên hệ thành công.');

