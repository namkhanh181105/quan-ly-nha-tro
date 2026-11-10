<?php
/**
 * ============================================================================
 * API SUPERADMIN: DANH SÁCH TÀI KHOẢN QUẢN TRỊ (ADMIN ACCOUNTS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/accounts.js (Hàm loadAccounts())
 * Phương thức: GET
 * Phân quyền: Chỉ Superadmin mới có quyền truy cập.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/admin_repository.php';

requireSuperAdmin();

$adminRepo = new AdminRepository();
$accounts = $adminRepo->getAll();

jsonResponse(true, 'Lấy danh sách tài khoản quản trị thành công.', $accounts);

