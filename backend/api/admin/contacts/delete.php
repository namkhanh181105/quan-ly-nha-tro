<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA TIN NHẮN LIÊN HỆ (DELETE CONTACT)
 * ============================================================================
 * Gọi bởi: Nút xác nhận xóa trên frontend/admin/contacts.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/contact_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã tin nhắn không hợp lệ.', null, 400);
}

$contactRepo = new ContactRepository();
$contactRepo->delete($id);

jsonResponse(true, 'Đã xóa tin nhắn liên hệ thành công.');

