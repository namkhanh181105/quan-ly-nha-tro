<?php
/**
 * ============================================================================
 * TRỢ GIÚP PHẢN HỒI JSON CHUẨN HÓA (RESPONSE HELPER)
 * ============================================================================
 * Định dạng phản hồi API thống nhất:
 * {
 *   "success": true/false,
 *   "message": "Thông báo kết quả",
 *   "data": { ... }
 * }
 */

/**
 * Trả về phản hồi JSON và kết thúc thực thi
 *
 * @param bool $success Trạng thái thành công hay thất bại
 * @param string $message Thông báo hiển thị cho người dùng
 * @param mixed $data Dữ liệu kèm theo
 * @param int $statusCode Mã HTTP Status (200, 400, 401, 403, 404, 500...)
 */
function jsonResponse(bool $success, string $message, $data = [], int $statusCode = 200): void {
    // Xóa bộ đệm đầu ra trước đó nếu có để đảm bảo JSON thuần túy
    if (ob_get_length()) {
        ob_clean();
    }

    http_response_code($statusCode);
    header('Content-Type: application/json; charset=UTF-8');
    // Chống lưu cache đối với các API động
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');

    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Đọc dữ liệu gửi lên dạng JSON từ request body (php://input)
 * Hỗ trợ các yêu cầu fetch với Content-Type: application/json
 *
 * @return array Mảng dữ liệu đã parse từ JSON body
 */
function getJsonInput(): array {
    $rawInput = file_get_contents('php://input');
    if (empty($rawInput)) {
        return [];
    }
    $decoded = json_decode($rawInput, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Lấy tham số kết hợp từ cả $_POST, $_GET và JSON body
 *
 * @return array
 */
function getRequestData(): array {
    $json = getJsonInput();
    return array_merge($_GET, $_POST, $json);
}

