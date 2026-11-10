<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: CHI TIẾT PHIẾU BẢO TRÌ (TICKET DETAIL)
 * ============================================================================
 * Gọi bởi: Modal xem tiến độ sửa chữa trên frontend/tenant/maintenance.html
 * Phương thức: GET
 * Tham số: id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';

$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Thiếu mã định danh phiếu.', null, 400);
}

$maintRepo = new MaintenanceRepository();
$ticket = $maintRepo->getById($id);

if (!$ticket || (int)$ticket['tenant_id'] !== $tenantId) {
    jsonResponse(false, 'Phiếu không tồn tại hoặc bạn không có quyền xem.', null, 403);
}

jsonResponse(true, 'Lấy chi tiết phiếu thành công.', $ticket);

