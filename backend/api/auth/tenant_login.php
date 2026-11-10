<?php
/**
 * ============================================================================
 * API: ĐĂNG NHẬP CỔNG CƯ DÂN (TENANT LOGIN)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/auth.js (Form #tenantLoginForm, nút #btnLogin)
 * Phương thức: POST
 * Dữ liệu gửi: login (số điện thoại hoặc email), password (string)
 * Kiểm tra:
 * - So khớp password trong bảng `tenants`
 * - Kiểm tra portal_status == 1 (1: Hoạt động, 0: Khóa)
 * Lưu thông tin vào $_SESSION['tenant_user'].
 * Trả về: JSON thông tin cư dân và thông tin phòng đang thuê.
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
$login = trim($input['login'] ?? $input['email'] ?? $input['phone'] ?? $input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($login) || empty($password)) {
    jsonResponse(false, 'Vui lòng nhập số điện thoại hoặc email và mật khẩu.', null, 400);
}

$tenantRepo = new TenantRepository();
$tenant = $tenantRepo->findByPhoneOrEmail($login);

if (!$tenant || empty($tenant['password']) || !password_verify($password, $tenant['password'])) {
    jsonResponse(false, 'Số điện thoại/email hoặc mật khẩu không chính xác.', null, 200);
}

// Kiểm tra trạng thái cổng cư dân (Chỉ tài khoản đã được BQL xác nhận duyệt: portal_status == 1 mới được truy cập)
if ((int)$tenant['portal_status'] !== 1) {
    jsonResponse(false, 'Tài khoản Cư dân của bạn đang chờ Ban Quản Lý phê duyệt hoặc đang tạm khóa. Vui lòng liên hệ BQL để được kích hoạt!', null, 200);
}

// Lưu session an toàn (loại bỏ trường mật khẩu)
unset($tenant['password']);
$_SESSION['tenant_user'] = $tenant;

$newCsrf = regenerateCsrfToken();

jsonResponse(true, 'Đăng nhập Cổng cư dân thành công.', [
    'tenant'     => $tenant,
    'csrf_token' => $newCsrf
]);

