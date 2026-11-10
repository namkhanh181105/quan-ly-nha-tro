<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CHI TIẾT PHIẾU BẢO TRÌ (ADMIN MAINTENANCE DETAIL)
 * ============================================================================
 * Gọi bởi: Modal xử lý phiếu sửa chữa trên frontend/admin/maintenance.html
 * Phương thức: GET
 * Tham số: id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';

requireAdmin();

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã phiếu không hợp lệ.', null, 400);
}

$maintRepo = new MaintenanceRepository();
$ticket = $maintRepo->getById($id);

if (!$ticket) {
    jsonResponse(false, 'Không tìm thấy phiếu yêu cầu sửa chữa.', null, 404);
}

jsonResponse(true, 'Lấy chi tiết phiếu thành công.', $ticket);

