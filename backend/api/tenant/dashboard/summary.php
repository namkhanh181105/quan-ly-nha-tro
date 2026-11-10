<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: TỔNG QUAN DASHBOARD (TENANT DASHBOARD SUMMARY)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/dashboard.js (Hàm loadDashboardSummary())
 * Phương thức: GET
 * Trả về:
 * - Thông tin phòng đang thuê, tiền cọc, thời hạn hợp đồng
 * - Hóa đơn chưa thanh toán gần nhất (kèm tình trạng bill chuyển khoản)
 * - Số lượng sự cố sửa chữa đang xử lý
 * - Thông báo mới nhất
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';
require_once __DIR__ . '/../../../repositories/notification_repository.php';

$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$tenantRepo = new TenantRepository();
$invoiceRepo = new InvoiceRepository();
$maintRepo = new MaintenanceRepository();
$notiRepo = new NotificationRepository();

$tenant = $tenantRepo->getById($tenantId);
$invoices = $invoiceRepo->getInvoicesByTenant($tenantId);

// Tìm hóa đơn chưa nộp hoặc còn nợ mới nhất
$unpaidInvoice = null;
foreach ($invoices as $inv) {
    if ($inv['payment_status'] !== 'paid') {
        $unpaidInvoice = $inv;
        break;
    }
}

// Lấy danh sách yêu cầu sửa chữa
$requests = $maintRepo->getByTenantId($tenantId);
$pendingRequests = 0;
foreach ($requests as $r) {
    if (in_array($r['status'], ['pending', 'processing'], true)) {
        $pendingRequests++;
    }
}

// Lấy 5 thông báo mới nhất
$notifications = array_slice($notiRepo->getNotificationsForTenant($tenantId), 0, 5);

$room = null;
if (!empty($tenant['room_id'])) {
    $room = [
        'id'            => (int)$tenant['room_id'],
        'room_number'   => $tenant['room_number'] ?? '',
        'title'         => $tenant['room_title'] ?? '',
        'floor'         => (int)($tenant['room_floor'] ?? 1),
        'price'         => (float)($tenant['room_price'] ?? 0),
        'category_name' => $tenant['room_title'] ?? 'Chung cư mini',
        'location_name' => $tenant['room_address'] ?? 'CCMN KhánhKaKa'
    ];
}

$tenantWithAliases = array_merge($tenant ?: [], [
    'start_date' => $tenant['contract_start'] ?? null,
    'end_date'   => $tenant['contract_end'] ?? null
]);

jsonResponse(true, 'Lấy dữ liệu tổng quan cư dân thành công.', [
    'tenant'               => $tenantWithAliases,
    'room'                 => $room,
    'latest_invoice'       => $unpaidInvoice,
    'unpaid_invoice'       => $unpaidInvoice,
    'recent_maintenance'   => $requests,
    'recent_notifications' => $notifications,
    'active_requests'      => $pendingRequests,
    'notifications'        => $notifications
]);

