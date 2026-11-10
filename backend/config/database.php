<?php
/**
 * ============================================================================
 * KẾT NỐI CƠ SỞ DỮ LIỆU MYSQL / MARIADB (PDO)
 * ============================================================================
 * Sử dụng PDO với prepared statements, chế độ báo lỗi ngoại lệ (ERRMODE_EXCEPTION),
 * hỗ trợ utf8mb4 và trả về mảng kết hợp (FETCH_ASSOC).
 */

require_once __DIR__ . '/app.php';

class Database {
    private static ?PDO $instance = null;

    // Cấu hình kết nối XAMPP mặc định
    private static string $host = '127.0.0.1';
    private static string $dbname = 'ql_nhatro';
    private static string $username = 'root';
    private static string $password = '';
    private static string $port = '3306';

    /**
     * Lấy đối tượng kết nối PDO duy nhất (Singleton Pattern)
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                self::$instance = new PDO($dsn, self::$username, self::$password, $options);
            } catch (PDOException $e) {
                // Nếu cổng 3306 không phản hồi, thử dự phòng sang cổng 3307 (rất phổ biến khi cài XAMPP bị trùng port)
                if (self::$port === '3306') {
                    try {
                        $dsnFallback = "mysql:host=" . self::$host . ";port=3307;dbname=" . self::$dbname . ";charset=utf8mb4";
                        self::$instance = new PDO($dsnFallback, self::$username, self::$password, $options);
                        return self::$instance;
                    } catch (PDOException $e2) {
                        // Tiếp tục báo lỗi
                    }
                }

                // Trả về JSON lỗi nếu không kết nối được database, không lộ thông tin nhạy cảm
                http_response_code(500);
                header('Content-Type: application/json; charset=UTF-8');
                echo json_encode([
                    'success' => false,
                    'message' => 'Lỗi kết nối cơ sở dữ liệu MySQL. Vui lòng bật MySQL trong XAMPP Control Panel và đảm bảo đã tạo database `ql_nhatro` (import file `database/ql_nhatro_full_latest.sql`).',
                    'error_code' => $e->getCode(),
                    'error_detail' => $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        return self::$instance;
    }
}

/**
 * Hàm trợ giúp nhanh lấy kết nối PDO
 */
function getDB(): PDO {
    return Database::getConnection();
}

