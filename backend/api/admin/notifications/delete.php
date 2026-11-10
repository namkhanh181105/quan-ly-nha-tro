<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA THÔNG BÁO (DELETE NOTIFICATION)
 * ============================================================================
 * Gọi bởi: Nút xóa thông báo trên frontend/admin/notifications.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/notification_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã thông báo không hợp lệ.', null, 400);
}

$notiRepo = new NotificationRepository();
$notiRepo->delete($id);

jsonResponse(true, 'Đã xóa thông báo thành công.');

