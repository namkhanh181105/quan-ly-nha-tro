<?php
/**
 * ============================================================================
 * API: LẤY THÔNG TIN KHÁCH HÀNG HIỆN TẠI (CUSTOMER USER ME)
 * ============================================================================
 * Gọi bởi: Header công khai hoặc trang profile khách hàng
 * Phương thức: GET
 * Trả về: JSON thông tin khách hàng nếu đã đăng nhập
 */

require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../repositories/user_repository.php';

$user = getCurrentUser();
if (!$user) {
    jsonResponse(false, 'Chưa đăng nhập tài khoản khách hàng.', null, 401);
}

$userRepo = new UserRepository();
$freshUser = $userRepo->getById((int)$user['id']);

if (!$freshUser || $freshUser['status'] === 'locked') {
    unset($_SESSION['customer_user']);
    jsonResponse(false, 'Tài khoản không tồn tại hoặc đã bị khóa.', null, 403);
}

$_SESSION['customer_user'] = $freshUser;
jsonResponse(true, 'Lấy thông tin tài khoản thành công.', $freshUser);

