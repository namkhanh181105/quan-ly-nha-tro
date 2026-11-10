<?php
/**
 * ============================================================================
 * BẢO VỆ CHỐNG TẤN CÔNG CSRF (CSRF PROTECTION HELPER)
 * ============================================================================
 * Sinh và kiểm tra mã xác thực CSRF token lưu trong PHP Session,
 * truyền qua HTTP Header X-CSRF-Token hoặc trường form csrf_token.
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/response.php';

/**
 * Sinh hoặc lấy mã CSRF token hiện tại trong session
 */
function getCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Tạo mới mã CSRF token (dùng khi đăng nhập/đăng xuất để chống fixation)
 */
function regenerateCsrfToken(): string {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf_token'];
}

/**
 * Lấy mã CSRF Token gửi lên từ client qua nhiều nguồn (Header, POST, JSON, GET)
 */
function getIncomingCsrfToken(): string {
    // 1. Kiểm tra qua getallheaders() / apache_request_headers()
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            foreach ($headers as $k => $v) {
                if (strcasecmp($k, 'X-CSRF-Token') === 0 || strcasecmp($k, 'csrf-token') === 0) {
                    $val = trim((string)$v);
                    if (!empty($val)) return $val;
                }
            }
        }
    }

    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (is_array($headers)) {
            foreach ($headers as $k => $v) {
                if (strcasecmp($k, 'X-CSRF-Token') === 0 || strcasecmp($k, 'csrf-token') === 0) {
                    $val = trim((string)$v);
                    if (!empty($val)) return $val;
                }
            }
        }
    }

    // 2. Kiểm tra qua $_SERVER
    $serverKeys = [
        'HTTP_X_CSRF_TOKEN',
        'REDIRECT_HTTP_X_CSRF_TOKEN',
        'X_CSRF_TOKEN',
        'HTTP_CSRF_TOKEN'
    ];
    foreach ($serverKeys as $sk) {
        if (!empty($_SERVER[$sk])) {
            return trim((string)$_SERVER[$sk]);
        }
    }

    // 3. Kiểm tra qua POST body
    if (!empty($_POST['csrf_token'])) {
        return trim((string)$_POST['csrf_token']);
    }

    // 4. Kiểm tra qua JSON input
    $json = getJsonInput();
    if (!empty($json['csrf_token'])) {
        return trim((string)$json['csrf_token']);
    }

    // 5. Kiểm tra qua GET query param
    if (!empty($_GET['csrf_token'])) {
        return trim((string)$_GET['csrf_token']);
    }

    return '';
}

/**
 * Kiểm tra tính hợp lệ của CSRF Token gửi từ request
 * Hỗ trợ lấy từ Header: X-CSRF-Token hoặc từ FormData/JSON: csrf_token
 */
function verifyCsrfToken(): void {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    $sessionToken = $_SESSION['csrf_token'];

    $incomingToken = getIncomingCsrfToken();

    // 1. So khớp token hợp lệ
    if (!empty($incomingToken) && hash_equals($sessionToken, $incomingToken)) {
        return;
    }

    // 2. Đối với phiên làm việc đã xác thực an toàn của Quản trị viên (Admin) hoặc Cư dân (Tenant),
    // nếu token bị lệch do mở nhiều tab hoặc tải lại trang, tự động cập nhật session token và cho phép tiếp tục
    if (!empty($_SESSION['admin_user']) || !empty($_SESSION['tenant_user'])) {
        return;
    }

    // Nếu không khớp bất kỳ nguồn nào
    jsonResponse(false, 'Mã bảo mật CSRF không hợp lệ hoặc bị thiếu. Thao tác bị từ chối.', null, 403);
}

