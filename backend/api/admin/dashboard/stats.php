<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: THỐNG KÊ DASHBOARD (ADMIN DASHBOARD STATS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/dashboard.js (Hàm loadDashboardStats())
 * Phương thức: GET
 * Trả về: Các chỉ số thống kê thực tế về phòng, cư dân, doanh thu, công nợ, lịch hẹn, sự cố.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/admin_repository.php';

requireAdmin();

$adminRepo = new AdminRepository();
$stats = $adminRepo->getDashboardStats();

jsonResponse(true, 'Lấy số liệu thống kê thành công.', $stats);

