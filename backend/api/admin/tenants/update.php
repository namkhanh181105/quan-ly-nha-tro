<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CẬP NHẬT HỒ SƠ NGƯỜI THUÊ (UPDATE TENANT)
 * ============================================================================
 * Gọi bởi: Modal sửa người thuê trên frontend/admin/tenants.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã người thuê không hợp lệ.', null, 400);
}

$fullname = sanitizeText($input['fullname'] ?? '');
$phone = sanitizeText($input['phone'] ?? '');
$email = sanitizeText($input['email'] ?? '');
$roomId = !empty($input['room_id']) ? (int)$input['room_id'] : null;
$idCard = sanitizeText($input['id_card'] ?? '');
$hometown = sanitizeText($input['hometown'] ?? '');
$depositAmount = (float)($input['deposit_amount'] ?? 0);
$contractStartRaw = trim($input['contract_start'] ?? '');
$contractEndRaw = trim($input['contract_end'] ?? '');
$occupantCount = (int)($input['occupant_count'] ?? 1);
$vehicleCount = (int)($input['vehicle_count'] ?? 1);
$note = sanitizeText($input['note'] ?? '');
$contractNotes = sanitizeText($input['contract_notes'] ?? '');

// Hàm chuẩn hóa định dạng ngày sang YYYY-MM-DD
$normalizeDate = function(?string $d): ?string {
    if (empty($d)) return null;
    $d = trim($d);
    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $d, $m)) {
        return sprintf('%04d-%02d-%02d', (int)$m[3], (int)$m[2], (int)$m[1]);
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) {
        return $d;
    }
    $ts = strtotime($d);
    return $ts ? date('Y-m-d', $ts) : $d;
};

$contractStart = $normalizeDate($contractStartRaw) ?: date('Y-m-d');
$contractEnd = $normalizeDate($contractEndRaw);

if (empty($fullname) || empty($phone)) {
    jsonResponse(false, 'Họ tên và số điện thoại là bắt buộc.', null, 400);
}

if (!isValidPhone($phone)) {
    jsonResponse(false, 'Số điện thoại không hợp lệ.', null, 400);
}

if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Email không đúng định dạng.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->getById($id);
if (!$tenant) {
    jsonResponse(false, 'Hồ sơ người thuê không tồn tại.', null, 404);
}

$oldRoomId = !empty($tenant['room_id']) ? (int)$tenant['room_id'] : null;
// Sau khi đã kiểm tra quyền Admin, CSRF token và tính hợp lệ của SĐT:
$tenantRepo->update($id, [
    'room_id'        => $roomId,
    'fullname'       => $fullname,
    'phone'          => $phone,
    'email'          => !empty($email) ? $email : null,
    'id_card'        => $idCard,
    'hometown'       => $hometown,
    'deposit_amount' => $depositAmount,
    'contract_start' => $contractStart,
    'contract_end'   => $contractEnd,
    'occupant_count' => $occupantCount,
    'vehicle_count'  => $vehicleCount,
    'note'           => $note,
    'contract_notes' => $contractNotes
]);

// Cập nhật trạng thái phòng tương ứng
$roomRepo = new RoomRepository();
if ($roomId && $roomId !== $oldRoomId) {
    $roomRepo->updateRoomStatus($roomId, 'rented');
    if ($oldRoomId) {
        $roomRepo->updateRoomStatus($oldRoomId, 'available');
    }
}

jsonResponse(true, 'Cập nhật thông tin người thuê thành công.');

//backend/repositories/room_repository.php (Dòng 299 - 302):