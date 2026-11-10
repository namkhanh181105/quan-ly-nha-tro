<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: ĐÁNH DẤU THÔNG BÁO ĐÃ ĐỌC (MARK READ)
 * ============================================================================
 * Gọi bởi: Nút đánh dấu đã đọc trên frontend/tenant/notifications.html
 * Phương thức: POST
 * Dữ liệu gửi: id (ID thông báo)
 * 
 * LƯU Ý QUY TẮC CƠ SỞ DỮ LIỆU:
 * Chỉ cho phép cập nhật is_read = 1 đối với thông báo riêng (tenant_id = ID cư dân).
 * Không áp dụng cho thông báo chung (tenant_id IS NULL) để tránh biến thông báo thành
 * đã đọc đối với tất cả cư dân khác trong tòa nhà.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/notification_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã thông báo không hợp lệ.', null, 400);
}

$notiRepo = new NotificationRepository();
// Hàm này chỉ update nếu id và tenant_id khớp nhau trong CSDL
$updated = $notiRepo->markAsReadForTenant($id, $tenantId);

if ($updated) {
    jsonResponse(true, 'Đã đánh dấu thông báo là đã đọc.');
} else {
    // Thông báo chung không thay đổi CSDL
    jsonResponse(true, 'Thông báo chung được ghi nhận.');
}

