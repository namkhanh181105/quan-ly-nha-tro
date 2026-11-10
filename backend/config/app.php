<?php
/**
 * ============================================================================
 * CẤU HÌNH HỆ THỐNG QUẢN LÝ NHÀ TRỌ (APP CONFIG)
 * ============================================================================
 * Tự động nhận diện đường dẫn gốc (Base URL), cấu hình session an toàn,
 * múi giờ Việt Nam và các hằng số thư mục lưu trữ.
 */

// Thiết lập múi giờ Việt Nam
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Khởi tạo session an toàn nếu chưa bắt đầu
if (session_status() === PHP_SESSION_NONE) {
    // Cấu hình cookie session: HttpOnly để chống XSS đánh cắp session
    session_set_cookie_params([
        'lifetime' => 86400 * 7, // 7 ngày
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Định nghĩa các đường dẫn thư mục vật lý (Filesystem Paths)
define('ROOT_PATH', dirname(__DIR__, 2));
define('BACKEND_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'backend');
define('UPLOADS_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'uploads');
define('STORAGE_PATH', ROOT_PATH . DIRECTORY_SEPARATOR . 'storage');

// Tự động phát hiện BASE_URL cho web server (hỗ trợ chạy cả ở root lẫn thư mục con XAMPP: http://localhost/ql_nhatro)
function getAppBaseUrl(): string {
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    
    // Lấy script name để trích xuất thư mục gốc dự án
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    // Tìm vị trí của /backend hoặc /frontend hoặc /index.php
    $baseFolder = '';
    if (preg_match('#^(.*?)/(backend|frontend|index\.php)#', $scriptName, $matches)) {
        $baseFolder = rtrim($matches[1], '/');
    } else {
        $baseFolder = rtrim(dirname($scriptName), '/\\');
    }
    
    return $protocol . $host . $baseFolder;
}

define('BASE_URL', getAppBaseUrl());
define('APP_NAME', 'Hệ Thống Quản Lý Nhà Trọ CCMN');

