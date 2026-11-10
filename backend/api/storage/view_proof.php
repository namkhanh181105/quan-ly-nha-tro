<?php
/**
 * ============================================================================
 * API BẢO MẬT: XEM ẢNH MINH CHỨNG CHUYỂN KHOẢN (VIEW PAYMENT PROOF)
 * ============================================================================
 * Gọi bởi: Modal xem bill trên frontend Admin và Tenant
 * Phương thức: GET
 * Tham số: file (tên file ảnh bill)
 * Bảo mật:
 * 1. Kiểm tra session: Phải là Admin HOẶC Cư dân sở hữu hóa đơn chứa file này.
 * 2. Ngăn chặn Directory Traversal (basename).
 * 3. Đọc và truyền tệp kèm Header Content-Type chuẩn.
 */

require_once __DIR__ . '/../../config/app.php';
require_once __DIR__ . '/../../helpers/auth.php';
require_once __DIR__ . '/../../config/database.php';

$filename = isset($_GET['file']) ? basename($_GET['file']) : '';

if (empty($filename)) {
    http_response_code(400);
    echo "Thiếu tên tệp.";
    exit;
}

$filePath = STORAGE_PATH . DIRECTORY_SEPARATOR . 'payment_proofs' . DIRECTORY_SEPARATOR . $filename;

if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    echo "Tệp minh chứng không tồn tại.";
    exit;
}

// Kiểm tra quyền truy cập: Admin HOẶC Tenant sở hữu
$admin = getCurrentAdmin();
$tenant = getCurrentTenant();

$hasPermission = false;
if ($admin) {
    $hasPermission = true;
} elseif ($tenant) {
    // Kiểm tra xem file này có thuộc về hóa đơn của tenant này không
    $db = getDB();
    $stmt = $db->prepare("SELECT COUNT(*) FROM invoices WHERE tenant_id = :tid AND payment_proof = :f");
    $stmt->execute(['tid' => $tenant['id'], 'f' => $filename]);
    if ((int)$stmt->fetchColumn() > 0) {
        $hasPermission = true;
    }
}

if (!$hasPermission) {
    http_response_code(403);
    echo "Quyền truy cập bị từ chối. Bạn không có quyền xem tệp này.";
    exit;
}

// Xác định MIME type và trả về luồng ảnh
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($filePath);

header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: private, max-age=86400');

readfile($filePath);
exit;

