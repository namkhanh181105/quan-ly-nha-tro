<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ QUẢN TRỊ VIÊN & THỐNG KÊ (ADMIN REPOSITORY)
 * ============================================================================
 * Quản lý bảng `admins` và truy vấn số liệu thống kê thực tế cho Dashboard.
 */

require_once __DIR__ . '/../config/database.php';

class AdminRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getByUsername(string $username): ?array {
        $stmt = $this->db->prepare("SELECT * FROM admins WHERE username = :un LIMIT 1");
        $stmt->execute(['un' => $username]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, username, fullname, email, phone, role, avatar, last_login, created_at FROM admins WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT id, username, fullname, email, phone, role, avatar, last_login, created_at FROM admins ORDER BY id ASC");
        return $stmt->fetchAll();
    }

    public function checkUsernameExists(string $username, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM admins WHERE username = :un";
        $params = ['un' => $username];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function checkEmailExists(string $email, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM admins WHERE email = :em";
        $params = ['em' => $email];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): int {
        $sql = "INSERT INTO admins (username, password, fullname, email, phone, role, avatar)
                VALUES (:un, :pw, :fn, :em, :ph, :ro, :av)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'un' => $data['username'],
            'pw' => $data['password'],
            'fn' => $data['fullname'],
            'em' => $data['email'],
            'ph' => $data['phone'] ?? null,
            'ro' => $data['role'] ?? 'admin',
            'av' => $data['avatar'] ?? 'default-avatar.png'
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $sql = "UPDATE admins SET fullname = :fn, email = :em, phone = :ph, role = :ro";
        $params = [
            'id' => $id,
            'fn' => $data['fullname'],
            'em' => $data['email'],
            'ph' => $data['phone'] ?? null,
            'ro' => $data['role'] ?? 'admin'
        ];

        if (!empty($data['password'])) {
            $sql .= ", password = :pw";
            $params['pw'] = $data['password'];
        }

        if (!empty($data['avatar'])) {
            $sql .= ", avatar = :av";
            $params['av'] = $data['avatar'];
        }

        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM admins WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function updateLastLogin(int $id): void {
        $stmt = $this->db->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    /**
     * Lấy các số liệu thực tế tổng hợp cho Dashboard
     */
    public function getDashboardStats(): array {
        // 1. Thống kê phòng
        $roomStats = $this->db->query("SELECT 
            COUNT(*) AS total_rooms,
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_rooms,
            SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) AS rented_rooms,
            SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_rooms
        FROM rooms")->fetch();

        // 2. Thống kê cư dân đang ở
        $activeTenants = (int)$this->db->query("SELECT COUNT(*) FROM tenants WHERE status = 'active'")->fetchColumn();

        // 3. Doanh thu tháng hiện tại và công nợ chưa thu
        $currentMonth = (int)date('n');
        $currentYear = (int)date('Y');
        $stmtInv = $this->db->prepare("SELECT 
            COALESCE(SUM(paid_amount), 0) AS revenue_current_month,
            COALESCE(SUM(debt_amount), 0) AS debt_current_month,
            SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_invoices_count,
            SUM(CASE WHEN payment_proof_status = 'pending' THEN 1 ELSE 0 END) AS pending_proofs_count
        FROM invoices 
        WHERE month = :m AND year = :y");
        $stmtInv->execute(['m' => $currentMonth, 'y' => $currentYear]);
        $invoiceStats = $stmtInv->fetch();

        // 4. Lịch hẹn xem phòng đang chờ xử lý
        $pendingBookings = (int)$this->db->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn();

        // 5. Yêu cầu sửa chữa đang chờ xử lý
        $pendingMaintenance = (int)$this->db->query("SELECT COUNT(*) FROM maintenance_requests WHERE status = 'pending'")->fetchColumn();

        // 6. Tin nhắn liên hệ mới
        $newContacts = (int)$this->db->query("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'")->fetchColumn();

        // 7. Yêu cầu gia hạn/trả phòng của cư dân
        $extensionRequests = (int)$this->db->query("SELECT COUNT(*) FROM tenants WHERE extension_status != 'none'")->fetchColumn();

        return [
            'total_rooms'           => (int)($roomStats['total_rooms'] ?? 0),
            'available_rooms'       => (int)($roomStats['available_rooms'] ?? 0),
            'rented_rooms'          => (int)($roomStats['rented_rooms'] ?? 0),
            'maintenance_rooms'     => (int)($roomStats['maintenance_rooms'] ?? 0),
            'active_tenants'        => $activeTenants,
            'revenue_current_month' => (float)($invoiceStats['revenue_current_month'] ?? 0),
            'debt_current_month'    => (float)($invoiceStats['debt_current_month'] ?? 0),
            'unpaid_invoices_count' => (int)($invoiceStats['unpaid_invoices_count'] ?? 0),
            'pending_proofs_count'  => (int)($invoiceStats['pending_proofs_count'] ?? 0),
            'pending_bookings'      => $pendingBookings,
            'pending_maintenance'   => $pendingMaintenance,
            'new_contacts'          => $newContacts,
            'extension_requests'    => $extensionRequests,
            'month'                 => $currentMonth,
            'year'                  => $currentYear
        ];
    }
}

