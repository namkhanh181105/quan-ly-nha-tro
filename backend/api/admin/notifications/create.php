<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: PHÁT THÔNG BÁO MỚI (CREATE NOTIFICATION)
 * ============================================================================
 * Gọi bởi: Modal #notificationModal trên frontend/admin/notifications.html (Nút #btnSaveNotification)
 * Phương thức: POST
 * Dữ liệu gửi:
 * - target_type: 'all' (Thông báo chung toàn khu trọ) hoặc 'individual' (Cư dân cụ thể)
 * - tenant_id: ID cư dân nhận thông báo (khi target_type = 'individual')
 * - title: Tiêu đề thông báo
 * - content: Nội dung chi tiết
 * - type: 'general', 'invoice', 'maintenance', 'contract'
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/notification_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$targetType = trim($input['target_type'] ?? 'all');
$tenantId = !empty($input['tenant_id']) ? (int)$input['tenant_id'] : null;
$title = sanitizeText($input['title'] ?? '');
$content = sanitizeText($input['content'] ?? '');
$type = sanitizeText($input['type'] ?? 'general');

if (empty($title) || empty($content)) {
    jsonResponse(false, 'Tiêu đề và nội dung thông báo không được để trống.', null, 400);
}

if ($targetType === 'all') {
    $tenantId = null; // NULL đại diện cho thông báo chung toàn khu trọ
} elseif (!$tenantId || $tenantId <= 0) {
    jsonResponse(false, 'Vui lòng chọn cư dân nhận thông báo cá nhân.', null, 400);
}

$notiRepo = new NotificationRepository();
$notiId = $notiRepo->create($tenantId, $title, $content, $type);

jsonResponse(true, 'Phát thông báo thành công!', ['notification_id' => $notiId], 201);

