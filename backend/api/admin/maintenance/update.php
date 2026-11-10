<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT PHIẾU BẢO TRÌ (ADMIN UPDATE MAINTENANCE)
 * ============================================================================
 * Gọi bởi: Modal #ticketModal trên frontend/admin/maintenance.html (Nút #btnSaveTicket)
 * Phương thức: POST
 * Dữ liệu gửi:
 * - id: ID phiếu
 * - status: 'pending', 'processing', 'completed', 'cancelled'
 * - assigned_technician: Tên/SĐT kỹ thuật viên phụ trách
 * - admin_notes: Ghi chú nội bộ
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$status = trim($input['status'] ?? '');
$technician = sanitizeText($input['assigned_technician'] ?? '');
$adminNotes = sanitizeText($input['admin_notes'] ?? '');

if ($id <= 0) {
    jsonResponse(false, 'Mã phiếu không hợp lệ.', null, 400);
}

if (!isValidEnum($status, ['pending', 'processing', 'completed', 'cancelled'])) {
    jsonResponse(false, 'Trạng thái xử lý không hợp lệ.', null, 400);
}

$maintRepo = new MaintenanceRepository();
$ticket = $maintRepo->getById($id);

if (!$ticket) {
    jsonResponse(false, 'Phiếu bảo trì không tồn tại.', null, 404);
}

$maintRepo->updateStatus($id, $status, $technician, $adminNotes);

jsonResponse(true, "Cập nhật tiến độ phiếu {$ticket['ticket_code']} thành công.");

