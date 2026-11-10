<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: YÊU CẦU GIA HẠN / TRẢ PHÒNG (EXTENSION REQUEST)
 * ============================================================================
 * Gọi bởi: Form #extensionRequestForm trên frontend/tenant/contract.html
 * Phương thức: POST
 * Dữ liệu gửi:
 * - request_type: 'requested_extension' (Xin gia hạn) hoặc 'requested_leave' (Xin trả phòng)
 * - note: Lý do, thời gian mong muốn gia hạn/trả phòng
 * Nghiệp vụ: Cập nhật các trường extension_status và extension_note trong bảng `tenants`.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$input = getRequestData();
$requestType = trim($input['request_type'] ?? '');
$note = sanitizeText($input['note'] ?? '');

if (!in_array($requestType, ['requested_extension', 'requested_leave'], true)) {
    jsonResponse(false, 'Loại yêu cầu không hợp lệ. Chỉ chấp nhận xin gia hạn hoặc xin trả phòng.', null, 400);
}

if (empty($note)) {
    jsonResponse(false, 'Vui lòng cung cấp chi tiết lý do và thời gian đề xuất.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenantRepo->updateExtensionRequest($tenantId, $requestType, $note);

$msg = ($requestType === 'requested_extension')
    ? 'Đã gửi yêu cầu gia hạn hợp đồng đến Ban quản lý. Chúng tôi sẽ sớm liên hệ phản hồi.'
    : 'Đã gửi thông báo kế hoạch trả phòng đến Ban quản lý. Chúng tôi sẽ liên hệ hướng dẫn bàn giao.';

jsonResponse(true, $msg);

