<?php
/**
 * ============================================================================
 * API: ĐĂNG KÝ TÀI KHOẢN CƯ DÂN (TENANT REGISTER)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/public/auth.js (Form #userRegisterForm trên register.html)
 * Phương thức: POST
 * Dữ liệu gửi: fullname, phone, email (tùy chọn), password
 * Nghiệp vụ:
 * - Người dùng đăng ký sẽ trở thành CƯ DÂN (bảng `tenants`)
 * - Trạng thái cổng cư dân mặc định: portal_status = 0 (CHỜ QUẢN TRỊ VIÊN DUYỆT)
 * - room_id: NULL (chờ BQL gán phòng khi ký hợp đồng chính thức)
 * - Sau khi Quản trị viên BQL phê duyệt trên admin/tenants.html, cư dân mới được đăng nhập.
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validation.php';
require_once __DIR__ . '/../../helpers/csrf.php';
require_once __DIR__ . '/../../repositories/tenant_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

$input = getRequestData();
$fullname = trim($input['fullname'] ?? '');
$phone = trim($input['phone'] ?? '');
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($fullname) || empty($phone) || empty($password)) {
    jsonResponse(false, 'Họ tên, số điện thoại và mật khẩu là bắt buộc.', null, 200);
}

if (!isValidPhone($phone)) {
    jsonResponse(false, 'Số điện thoại không hợp lệ (yêu cầu 10 số hợp lệ tại Việt Nam).', null, 200);
}

if (!empty($email) && !isValidEmail($email)) {
    jsonResponse(false, 'Định dạng email không hợp lệ.', null, 200);
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Mật khẩu phải chứa ít nhất 6 ký tự.', null, 200);
}

$tenantRepo = new TenantRepository();

// Kiểm tra số điện thoại hoặc email đã đăng ký trong bảng tenants chưa
$existing = $tenantRepo->findByPhoneOrEmail($phone);
if ($existing) {
    jsonResponse(false, 'Số điện thoại này đã được đăng ký trong hệ thống cư dân.', null, 200);
}

if (!empty($email)) {
    $existingEmail = $tenantRepo->findByPhoneOrEmail($email);
    if ($existingEmail) {
        jsonResponse(false, 'Địa chỉ email này đã được đăng ký trong hệ thống cư dân.', null, 200);
    }
}

$pwHash = password_hash($password, PASSWORD_BCRYPT);

$newTenantId = $tenantRepo->create([
    'room_id'          => null,
    'fullname'         => $fullname,
    'phone'            => $phone,
    'email'            => !empty($email) ? $email : null,
    'password'         => $pwHash,
    'avatar'           => 'default-avatar.svg',
    'id_card'          => null,
    'hometown'         => null,
    'deposit_amount'   => 0,
    'contract_start'   => date('Y-m-d'),
    'contract_end'     => null,
    'occupant_count'   => 1,
    'vehicle_count'    => 1,
    'status'           => 'active',
    'portal_status'    => 0, // 0 = Chờ Ban Quản Lý phê duyệt mới được truy cập Cổng Cư Dân
    'note'             => 'Đăng ký tài khoản cư dân trực tuyến - Chờ BQL phê duyệt'
]);

jsonResponse(true, 'Đăng ký tài khoản cư dân thành công! Tài khoản của bạn đang chờ Ban Quản Lý phê duyệt trước khi có thể đăng nhập Cổng Cư Dân.', [
    'tenant_id' => $newTenantId
]);

