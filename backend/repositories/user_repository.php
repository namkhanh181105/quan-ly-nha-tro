<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ KHÁCH HÀNG (USER REPOSITORY)
 * ============================================================================
 * Quản lý tài khoản khách hàng độc lập trong bảng `users`.
 * Không tự ý liên kết người dùng với bảng `tenants`.
 */

require_once __DIR__ . '/../config/database.php';

class UserRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getByPhone(string $phone): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE phone = :ph LIMIT 1");
        $stmt->execute(['ph' => $phone]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :em LIMIT 1");
        $stmt->execute(['em' => $email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Tìm khách hàng theo Số điện thoại hoặc Email
     */
    public function findByPhoneOrEmail(string $identifier): ?array {
        $sql = "SELECT * FROM users WHERE (phone = :phone_login OR email = :email_login) LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'phone_login' => $identifier,
            'email_login' => $identifier
        ]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, fullname, phone, email, status, created_at, last_login FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function checkPhoneExists(string $phone, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM users WHERE phone = :ph";
        $params = ['ph' => $phone];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function checkEmailExists(string $email, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM users WHERE email = :em";
        $params = ['em' => $email];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(string $fullname, string $phone, ?string $email, string $passwordHash): int {
        $sql = "INSERT INTO users (fullname, phone, email, password, status, created_at)
                VALUES (:fn, :ph, :em, :pw, 'active', NOW())";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'fn' => $fullname,
            'ph' => $phone,
            'em' => $email,
            'pw' => $passwordHash
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateProfile(int $id, string $fullname, ?string $email): bool {
        $stmt = $this->db->prepare("UPDATE users SET fullname = :fn, email = :em WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'fn' => $fullname,
            'em' => $email
        ]);
    }

    public function changePassword(int $id, string $passwordHash): bool {
        $stmt = $this->db->prepare("UPDATE users SET password = :pw WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'pw' => $passwordHash
        ]);
    }

    public function updateLastLogin(int $id): void {
        $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }
}

