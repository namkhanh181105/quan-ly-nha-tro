<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH PHIẾU BẢO TRÌ SỬA CHỮA (ADMIN MAINTENANCE LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/maintenance.js (Hàm loadRequests(), bộ lọc #maintenanceFilterForm)
 * Phương thức: GET
 * Tham số lọc: keyword, status, urgency, category, page, limit
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';

requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword'  => $_GET['keyword'] ?? '',
    'status'   => $_GET['status'] ?? '',
    'urgency'  => $_GET['urgency'] ?? '',
    'category' => $_GET['category'] ?? ''
];

$maintRepo = new MaintenanceRepository();
$items = $maintRepo->getRequests($filters, $limit, $offset);
$total = $maintRepo->countRequests($filters);

jsonResponse(true, 'Lấy danh sách yêu cầu bảo trì thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

