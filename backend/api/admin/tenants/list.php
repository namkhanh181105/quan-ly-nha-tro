<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH CƯ DÂN / HỢP ĐỒNG (ADMIN TENANTS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/tenants.js (Hàm loadTenants(), bộ lọc #tenantFilterForm)
 * Phương thức: GET
 * Tham số:
 * - keyword: Tìm theo họ tên, số điện thoại, CCCD, email, số phòng
 * - status: 'active' (đang ở), 'ended' (đã trả phòng)
 * - room_id: Lọc theo phòng
 * - portal_status: 1 (hoạt động), 0 (khóa tài khoản portal)
 * - extension_status: 'none', 'requested_extension', 'requested_leave'
 * - page, limit: Phân trang
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword'          => $_GET['keyword'] ?? '',
    'status'           => $_GET['status'] ?? '',
    'room_id'          => $_GET['room_id'] ?? '',
    'portal_status'    => $_GET['portal_status'] ?? '',
    'extension_status' => $_GET['extension_status'] ?? ''
];

$tenantRepo = new TenantRepository();
$items = $tenantRepo->getTenants($filters, $limit, $offset);
$total = $tenantRepo->countTenants($filters);

jsonResponse(true, 'Lấy danh sách người thuê thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

