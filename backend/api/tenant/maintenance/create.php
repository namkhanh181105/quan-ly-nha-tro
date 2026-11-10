<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: GỬI YÊU CẦU BÁO HỎNG / SỬA CHỮA (CREATE TICKET)
 * ============================================================================
 * Gọi bởi: Modal #createTicketModal trên frontend/tenant/maintenance.html
 * Phương thức: POST
 * Dữ liệu gửi:
 * - category: 'dieuhoa', 'dien', 'nuoc', 'khoacua', 'thietbi', 'khac'
 * - urgency: 'normal', 'urgent', 'emergency'
 * - description: Mô tả chi tiết sự cố
 * - preferred_time: Thời gian kỹ thuật viên có thể vào phòng
 * Trả về: Mã phiếu ticket_code và ID bản ghi.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($tenantId);

if (!$tenant || empty($tenant['room_id'])) {
    jsonResponse(false, 'Bạn chưa được gán phòng thuê cố định để báo hỏng thiết bị.', null, 400);
}

$input = getRequestData();
$category = sanitizeText($input['category'] ?? '');
$urgency = trim($input['urgency'] ?? 'normal');
$description = sanitizeText($input['description'] ?? '');
$preferredTime = sanitizeText($input['preferred_time'] ?? '');

if (empty($category) || empty($description)) {
    jsonResponse(false, 'Vui lòng chọn danh mục sự cố và mô tả chi tiết hư hỏng.', null, 400);
}

if (!isValidEnum($urgency, ['normal', 'urgent', 'emergency'])) {
    $urgency = 'normal';
}

// Sinh mã phiếu theo quy chuẩn: SC-YYYY-ROOM-RANDOM
$year = date('Y');
$roomNum = preg_replace('/[^a-zA-Z0-9]/', '', $tenant['room_number'] ?? 'R');
$ticketCode = "SC-{$year}-{$roomNum}-" . strtoupper(bin2hex(random_bytes(2)));

$maintRepo = new MaintenanceRepository();
$ticketId = $maintRepo->create([
    'tenant_id'           => $tenantId,
    'room_id'             => (int)$tenant['room_id'],
    'ticket_code'         => $ticketCode,
    'room_number'         => $tenant['room_number'],
    'tenant_name'         => $tenant['fullname'],
    'tenant_phone'        => $tenant['phone'],
    'category'            => $category,
    'urgency'             => $urgency,
    'description'         => $description,
    'preferred_time'      => !empty($preferredTime) ? $preferredTime : 'Trong giờ hành chính',
    'status'              => 'pending',
    'admin_notes'         => null,
    'assigned_technician' => null
]);

jsonResponse(true, "Gửi phiếu báo hỏng thành công! Mã theo dõi: {$ticketCode}.", [
    'ticket_id'   => $ticketId,
    'ticket_code' => $ticketCode
], 201);

