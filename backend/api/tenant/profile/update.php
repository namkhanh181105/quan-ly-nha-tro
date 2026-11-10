<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: CẬP NHẬT HỒ SƠ & AVATAR (UPDATE TENANT PROFILE)
 * ============================================================================
 * Gọi bởi: Form #tenantProfileForm trên frontend/tenant/profile.html
 * Phương thức: POST (FormData hỗ trợ upload ảnh đại diện)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/upload.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/tenant_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$fullname = sanitizeText($_POST['fullname'] ?? '');
$hometown = sanitizeText($_POST['hometown'] ?? '');

if (empty($fullname)) {
    jsonResponse(false, 'Họ tên không được để trống.', null, 400);
}

// Xử lý upload ảnh đại diện nếu có
$avatarFilename = null;
if (!empty($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $uploadRes = handleFileUpload(
        $_FILES['avatar'],
        UPLOADS_PATH . DIRECTORY_SEPARATOR . 'avatars',
        ['image/jpeg', 'image/png', 'image/webp'],
        ['jpg', 'jpeg', 'png', 'webp'],
        2097152 // 2MB
    );

    if (!$uploadRes['success']) {
        jsonResponse(false, 'Lỗi tải ảnh đại diện: ' . $uploadRes['message'], null, 400);
    }
    $avatarFilename = $uploadRes['filename'];
}

$tenantRepo = new TenantRepository();
$tenantRepo->updateTenantSelfProfile($tenantId, $fullname, $hometown, $avatarFilename);

// Đồng bộ session
$_SESSION['tenant_user']['fullname'] = $fullname;
if ($avatarFilename) {
    $_SESSION['tenant_user']['avatar'] = $avatarFilename;
}

jsonResponse(true, 'Cập nhật hồ sơ thành công.', [
    'fullname' => $fullname,
    'avatar'   => $avatarFilename ?? ($_SESSION['tenant_user']['avatar'] ?? 'default-avatar.svg')
]);

