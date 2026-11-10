<?php
/**
 * ============================================================================
 * API SUPERADMIN: XÓA TÀI KHOẢN QUẢN TRỊ (DELETE ADMIN ACCOUNT)
 * ============================================================================
 * Gọi bởi: Nút xác nhận xóa tài khoản trên frontend/admin/accounts.html
 * Phương thức: POST
 * Phân quyền: requireSuperAdmin()
 * Kiểm tra: Không được tự xóa tài khoản của chính mình đang đăng nhập.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/admin_repository.php';

$currentAdmin = requireSuperAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã tài khoản không hợp lệ.', null, 400);
}

if ($id === (int)$currentAdmin['id']) {
    jsonResponse(false, 'Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình.', null, 400);
}

$adminRepo = new AdminRepository();
$account = $adminRepo->getById($id);

if (!$account) {
    jsonResponse(false, 'Tài khoản không tồn tại.', null, 404);
}

$adminRepo->delete($id);

jsonResponse(true, "Đã xóa tài khoản quản trị '{$account['username']}' thành công.");

