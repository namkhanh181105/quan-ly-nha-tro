<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: KẾT THÚC HỢP ĐỒNG THUÊ (END TENANCY)
 * ============================================================================
 * Gọi bởi: Nút #btnEndContract trên bảng danh sách người thuê (modal xác nhận trả phòng)
 * Phương thức: POST
 * Dữ liệu gửi: id (int)
 * Nghiệp vụ:
 * 1. Chạy trong PDO Transaction: Cập nhật status = 'ended'.
 * 2. Giữ nguyên toàn bộ lịch sử, không xóa dữ liệu.
 * 3. Tự động trả trạng thái phòng về 'available' nếu không còn người thuê active nào khác.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../services/tenant_service.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã người thuê không hợp lệ.', null, 400);
}

$tenantService = new TenantService();
$res = $tenantService->endTenancy($id);

if (!$res['success']) {
    jsonResponse(false, $res['message'], null, 400);
}

jsonResponse(true, $res['message']);

