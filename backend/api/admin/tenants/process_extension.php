<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XỬ LÝ YÊU CẦU GIA HẠN / TRẢ PHÒNG (PROCESS EXTENSION)
 * ============================================================================
 * Gọi bởi: Modal xử lý gia hạn trên frontend/admin/tenants.html
 * Phương thức: POST
 * Dữ liệu gửi:
 * - id: ID người thuê
 * - action: 'approve_extension', 'reject_extension', 'approve_leave'
 * - new_end_date: Ngày hết hạn mới (nếu đồng ý gia hạn)
 * - admin_note: Ghi chú xử lý của Quản trị viên
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';
require_once __DIR__ . '/../../../services/tenant_service.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$action = trim($input['action'] ?? '');
$newEndDate = trim($input['new_end_date'] ?? '');
$adminNote = sanitizeText($input['admin_note'] ?? '');

if ($id <= 0) {
    jsonResponse(false, 'Mã người thuê không hợp lệ.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($id);
if (!$tenant) {
    jsonResponse(false, 'Hồ sơ người thuê không tồn tại.', null, 404);
}

if ($action === 'approve_extension') {
    if (empty($newEndDate) || !isValidDate($newEndDate)) {
        jsonResponse(false, 'Vui lòng chọn ngày hết hạn hợp đồng mới hợp lệ.', null, 400);
    }
    $note = "Đã duyệt gia hạn đến ngày {$newEndDate}. " . $adminNote;
    $tenantRepo->processExtension($id, $newEndDate, $note);
    jsonResponse(true, "Đã duyệt gia hạn hợp đồng đến ngày {$newEndDate}.");
} elseif ($action === 'reject_extension') {
    $note = "Từ chối yêu cầu gia hạn/trả phòng. " . $adminNote;
    $tenantRepo->processExtension($id, null, $note);
    jsonResponse(true, "Đã ghi nhận từ chối yêu cầu.");
} elseif ($action === 'approve_leave') {
    // Chấp nhận trả phòng -> kết thúc hợp đồng
    $tenantService = new TenantService();
    $res = $tenantService->endTenancy($id);
    if (!$res['success']) {
        jsonResponse(false, $res['message'], null, 400);
    }
    $tenantRepo->processExtension($id, null, "Đã chấp nhận trả phòng: " . $adminNote);
    jsonResponse(true, "Đã hoàn tất thủ tục trả phòng theo yêu cầu cư dân.");
} else {
    jsonResponse(false, 'Hành động xử lý không hợp lệ.', null, 400);
}

