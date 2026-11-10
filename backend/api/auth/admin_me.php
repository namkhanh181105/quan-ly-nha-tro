<?php
/**
 * ============================================================================
 * API: LẤY THÔNG TIN QUẢN TRỊ VIÊN ĐANG ĐĂNG NHẬP (ADMIN ME)
 * ============================================================================
 * Gọi bởi: Header/sidebar admin để hiển thị tên và kiểm tra quyền superadmin
 * Phương thức: GET
 * Trả về: JSON thông tin admin trong session
 */

require_once __DIR__ . '/../../helpers/auth.php';

$admin = requireAdmin();
jsonResponse(true, 'Lấy thông tin tài khoản thành công.', $admin);

