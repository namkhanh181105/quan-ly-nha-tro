<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: CHI TIẾT HỢP ĐỒNG THUÊ (GET CONTRACT DETAILS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/contract.js (Hàm loadContractInfo())
 * Phương thức: GET
 * Trả về:
 * - Thông tin phòng, giá thuê, tiền cọc, ngày bắt đầu và kết thúc
 * - Số người ở, số lượng xe
 * - Danh sách tài sản, nội thất bàn giao (contract_notes)
 * - Tình trạng yêu cầu gia hạn/trả phòng hiện tại (extension_status, extension_note)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

$sessionTenant = requireTenant();
$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById((int)$sessionTenant['id']);

if (!$tenant) {
    jsonResponse(false, 'Không tìm thấy hồ sơ hợp đồng.', null, 404);
}

unset($tenant['password']);

$room = null;
if (!empty($tenant['room_id'])) {
    $room = [
        'id'               => (int)$tenant['room_id'],
        'room_number'      => $tenant['room_number'] ?? '',
        'title'            => $tenant['room_title'] ?? ('Phòng ' . ($tenant['room_number'] ?? '')),
        'floor'            => (int)($tenant['room_floor'] ?? 1),
        'price'            => (float)($tenant['room_price'] ?? 0),
        'electricity_rate' => (float)($tenant['electricity_price'] ?? 3800),
        'water_rate'       => (float)($tenant['water_price'] ?? 30000),
        'address'          => $tenant['room_address'] ?? 'Số 18, Ngõ 86 Cầu Giấy, Hà Nội',
        'category_name'    => $tenant['room_title'] ?? 'Chung cư mini cao cấp',
        'location_name'    => $tenant['room_address'] ?? 'CCMN KhánhKaKa'
    ];
}

$tenantWithAliases = array_merge($tenant, [
    'start_date' => $tenant['contract_start'],
    'end_date'   => $tenant['contract_end']
]);

jsonResponse(true, 'Lấy thông tin hợp đồng thành công.', [
    'tenant' => $tenantWithAliases,
    'room'   => $room,
    ...$tenantWithAliases
]);
