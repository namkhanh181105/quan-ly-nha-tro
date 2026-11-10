<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ LỊCH HẸN XEM PHÒNG (BOOKING REPOSITORY)
 * ============================================================================
 * Quản lý lịch xem phòng trong bảng `bookings`.
 * Lưu ý quan trọng: Duyệt lịch xem phòng (approved) KHÔNG tự động chuyển trạng thái phòng thành 'rented'.
 */

require_once __DIR__ . '/../config/database.php';

class BookingRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getBookings(array $filters = [], int $limit = 20, int $offset = 0): array {
        $sql = "SELECT b.*, r.room_number, r.title AS room_title, r.price AS room_price, r.floor AS room_floor
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (b.customer_name LIKE :kw OR b.customer_phone LIKE :kw OR b.customer_email LIKE :kw OR r.room_number LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }

        if (!empty($filters['status'])) {
            $sql .= " AND b.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['room_id'])) {
            $sql .= " AND b.room_id = :room_id";
            $params['room_id'] = (int)$filters['room_id'];
        }

        if (!empty($filters['user_id'])) {
            $sql .= " AND b.user_id = :uid";
            $params['uid'] = (int)$filters['user_id'];
        }

        $sql .= " ORDER BY b.id DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function countBookings(array $filters = []): int {
        $sql = "SELECT COUNT(*) FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (b.customer_name LIKE :kw OR b.customer_phone LIKE :kw OR b.customer_email LIKE :kw OR r.room_number LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }
        if (!empty($filters['status'])) {
            $sql .= " AND b.status = :status";
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['room_id'])) {
            $sql .= " AND b.room_id = :room_id";
            $params['room_id'] = (int)$filters['room_id'];
        }
        if (!empty($filters['user_id'])) {
            $sql .= " AND b.user_id = :uid";
            $params['uid'] = (int)$filters['user_id'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT b.*, r.room_number, r.title AS room_title, r.price AS room_price, r.floor AS room_floor, r.address AS room_address
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                WHERE b.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int {
        $sql = "INSERT INTO bookings (room_id, customer_name, customer_phone, customer_email, appointment_date, note, status, user_id)
                VALUES (:rid, :name, :phone, :email, :adate, :note, :status, :uid)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'rid'   => (int)$data['room_id'],
            'name'  => $data['customer_name'],
            'phone' => $data['customer_phone'],
            'email' => $data['customer_email'] ?? null,
            'adate' => $data['appointment_date'],
            'note'  => $data['note'] ?? null,
            'status'=> $data['status'] ?? 'pending',
            'uid'   => !empty($data['user_id']) ? (int)$data['user_id'] : null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status, ?string $note = null): bool {
        $sql = "UPDATE bookings SET status = :status";
        $params = ['id' => $id, 'status' => $status];
        if ($note !== null) {
            $sql .= ", note = CONCAT(IFNULL(note, ''), '\n[Cập nhật]: ', :note)";
            $params['note'] = $note;
        }
        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM bookings WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function getByUserId(int $userId): array {
        $sql = "SELECT b.*, r.room_number, r.title AS room_title, r.price AS room_price
                FROM bookings b
                LEFT JOIN rooms r ON b.room_id = r.id
                WHERE b.user_id = :uid
                ORDER BY b.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll();
    }
}

