<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: THÊM HỢP ĐỒNG & GÁN PHÒNG CHO CƯ DÂN (ASSIGN TENANT TO ROOM)
 * ============================================================================
 * Gọi bởi: Modal #tenantForm trên frontend/admin/tenants.html (Nút submit #btnSaveTenant)
 * Phương thức: POST
 * Nghiệp vụ:
 * 1. Kiểm tra sức chứa tối đa của phòng.
 * 2. Ngăn chặn nhiều hợp đồng active cùng đại diện một phòng.
 * 3. Chạy trong PDO Transaction: Tạo bản ghi `tenants` và chuyển trạng thái phòng sang 'rented'.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../services/tenant_service.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$fullname = sanitizeText($input['fullname'] ?? '');
$phone = sanitizeText($input['phone'] ?? '');
$email = sanitizeText($input['email'] ?? '');
$idCard = sanitizeText($input['id_card'] ?? '');
$hometown = sanitizeText($input['hometown'] ?? '');
$roomId = !empty($input['room_id']) ? (int)$input['room_id'] : null;
$depositAmount = (float)($input['deposit_amount'] ?? 0);
$contractStart = trim($input['contract_start'] ?? '');
$contractEnd = trim($input['contract_end'] ?? '');
$occupantCount = (int)($input['occupant_count'] ?? 1);
$vehicleCount = (int)($input['vehicle_count'] ?? 1);
$password = trim($input['password'] ?? 'tenant123');
$note = sanitizeText($input['note'] ?? '');
$contractNotes = sanitizeText($input['contract_notes'] ?? '');

if (empty($fullname) || empty($phone) || empty($contractStart)) {
    jsonResponse(false, 'Họ tên, số điện thoại và ngày bắt đầu hợp đồng là bắt buộc.', null, 400);
}

if (!isValidPhone($phone)) {
    jsonResponse(false, 'Số điện thoại không hợp lệ (yêu cầu 10 số).', null, 400);
}

if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Định dạng email không hợp lệ.', null, 400);
}

if (!isValidDate($contractStart)) {
    jsonResponse(false, 'Ngày bắt đầu hợp đồng không đúng định dạng YYYY-MM-DD.', null, 400);
}

if (!empty($contractEnd) && !isValidDate($contractEnd)) {
    jsonResponse(false, 'Ngày hết hạn hợp đồng không đúng định dạng YYYY-MM-DD.', null, 400);
}

if ($depositAmount < 0 || $occupantCount <= 0 || $vehicleCount < 0) {
    jsonResponse(false, 'Tiền đặt cọc, số người ở hoặc số lượng xe không hợp lệ.', null, 400);
}

$tenantService = new TenantService();
$res = $tenantService->assignRoomToTenant([
    'room_id'        => $roomId,
    'fullname'       => $fullname,
    'phone'          => $phone,
    'email'          => !empty($email) ? $email : null,
    'password'       => $password,
    'id_card'        => $idCard,
    'hometown'       => $hometown,
    'deposit_amount' => $depositAmount,
    'contract_start' => $contractStart,
    'contract_end'   => !empty($contractEnd) ? $contractEnd : null,
    'occupant_count' => $occupantCount,
    'vehicle_count'  => $vehicleCount,
    'status'         => 'active',
    'portal_status'  => 1,
    'note'           => $note,
    'contract_notes' => $contractNotes
]);

if (!$res['success']) {
    jsonResponse(false, $res['message'], null, 400);
}

jsonResponse(true, $res['message'], ['tenant_id' => $res['tenant_id']], 201);

