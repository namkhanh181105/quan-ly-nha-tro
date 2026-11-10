<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: DANH SÁCH THÔNG BÁO (MY NOTIFICATIONS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/notifications.js (Hàm loadNotifications())
 * Phương thức: GET
 * Trả về: Thông báo chung toàn tòa nhà (tenant_id IS NULL) và thông báo riêng (tenant_id = ID)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/notification_repository.php';

$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$notiRepo = new NotificationRepository();
$notifications = $notiRepo->getNotificationsForTenant($tenantId);

jsonResponse(true, 'Lấy danh sách thông báo thành công.', $notifications);

