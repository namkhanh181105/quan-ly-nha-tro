<?php
/**
 * ============================================================================
 * API KHÁCH HÀNG: LẤY HỒ SƠ CÁ NHÂN (GET PROFILE)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/customer/profile.js (Hàm loadProfile())
 * Phương thức: GET
 * Trả về: Thông tin tài khoản khách hàng từ session/database
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/user_repository.php';

$sessionUser = requireUser();
$userRepo = new UserRepository();
$user = $userRepo->getById((int)$sessionUser['id']);

if (!$user) {
    jsonResponse(false, 'Tài khoản không tồn tại.', null, 404);
}

jsonResponse(true, 'Lấy thông tin hồ sơ thành công.', $user);

