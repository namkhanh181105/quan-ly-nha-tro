<?php
/**
 * ============================================================================
 * API: ĐĂNG XUẤT CỔNG CƯ DÂN (TENANT LOGOUT)
 * ============================================================================
 * Gọi bởi: Nút #btnTenantLogout trên header/sidebar cư dân
 * Phương thức: POST
 * Xử lý: Xóa session $_SESSION['tenant_user']
 * Trả về: JSON success
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/csrf.php';

unset($_SESSION['tenant_user']);
regenerateCsrfToken();

jsonResponse(true, 'Đã đăng xuất Cổng cư dân thành công.');

