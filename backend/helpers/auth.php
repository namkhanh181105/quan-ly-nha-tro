<?php
/**
 * ============================================================================
 * XÁC THỰC VÀ PHÂN QUYỀN (AUTHENTICATION & AUTHORIZATION HELPER)
 * ============================================================================
 * Phân chia rõ ràng 3 phân hệ độc lập:
 * 1. Admin (bảng admins): Quản trị viên hệ thống (admin / superadmin).
 * 2. Tenant (bảng tenants): Cư dân đang thuê trọ truy cập Cổng cư dân (portal_status = 1).
 * 3. User (bảng users): Khách hàng đăng ký tài khoản xem phòng/gửi liên hệ.
 * 
 * Tuyệt đối không tin ID do frontend gửi lên, mọi thao tác lấy ID trực tiếp từ Session.
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/response.php';

// ==========================================
// 1. PHÂN HỆ QUẢN TRỊ VIÊN (ADMINS)
// ==========================================

function getCurrentAdmin(): ?array {
    return $_SESSION['admin_user'] ?? null;
}

function requireAdmin(): array {
    $admin = getCurrentAdmin();
    if (!$admin || empty($admin['id'])) {
        jsonResponse(false, 'Yêu cầu đăng nhập tài khoản quản trị viên.', null, 401);
    }
    return $admin;
}

function requireSuperAdmin(): array {
    $admin = requireAdmin();
    if (($admin['role'] ?? '') !== 'superadmin') {
        jsonResponse(false, 'Quyền truy cập bị từ chối. Chức năng chỉ dành cho Superadmin.', null, 403);
    }
    return $admin;
}

// ==========================================
// 2. PHÂN HỆ CƯ DÂN (TENANTS)
// ==========================================

function getCurrentTenant(): ?array {
    return $_SESSION['tenant_user'] ?? null;
}

function requireTenant(): array {
    $tenant = getCurrentTenant();
    if (!$tenant || empty($tenant['id'])) {
        jsonResponse(false, 'Yêu cầu đăng nhập Cổng cư dân để tiếp tục.', null, 401);
    }
    
    // Kiểm tra trạng thái cổng cư dân (portal_status: 1 = Hoạt động, 0 = Bị khóa)
    if (isset($tenant['portal_status']) && (int)$tenant['portal_status'] === 0) {
        unset($_SESSION['tenant_user']);
        jsonResponse(false, 'Tài khoản Cổng cư dân của bạn đã bị khóa bởi Quản trị viên.', null, 403);
    }
    
    return $tenant;
}

// ==========================================
// 3. PHÂN HỆ KHÁCH HÀNG (USERS)
// ==========================================

function getCurrentUser(): ?array {
    return $_SESSION['customer_user'] ?? null;
}

function requireUser(): array {
    $user = getCurrentUser();
    if (!$user || empty($user['id'])) {
        jsonResponse(false, 'Yêu cầu đăng nhập tài khoản khách hàng để xem lịch hẹn/liên hệ.', null, 401);
    }

    if (isset($user['status']) && $user['status'] === 'locked') {
        unset($_SESSION['customer_user']);
        jsonResponse(false, 'Tài khoản khách hàng này đã bị khóa.', null, 403);
    }

    return $user;
}

