<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH THÔNG BÁO (ADMIN NOTIFICATIONS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/notifications.js (Hàm loadNotifications())
 * Phương thức: GET
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/notification_repository.php';

requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(100, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$notiRepo = new NotificationRepository();
$items = $notiRepo->getAllNotifications($limit, $offset);
$total = $notiRepo->countAll();

jsonResponse(true, 'Lấy danh sách thông báo thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

