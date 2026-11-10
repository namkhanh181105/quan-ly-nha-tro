<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ TIN NHẮN LIÊN HỆ (CONTACT REPOSITORY)
 * ============================================================================
 * Quản lý thông tin liên hệ gửi từ khách hàng vào bảng `contact_messages`.
 */

require_once __DIR__ . '/../config/database.php';

class ContactRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getContacts(array $filters = [], int $limit = 20, int $offset = 0): array {
        $sql = "SELECT * FROM contact_messages WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (fullname LIKE :kw OR phone LIKE :kw OR email LIKE :kw OR subject LIKE :kw OR message LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }

        if (!empty($filters['status'])) {
            $sql .= " AND status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['user_id'])) {
            $sql .= " AND user_id = :uid";
            $params['uid'] = (int)$filters['user_id'];
        }

        $sql .= " ORDER BY id DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function countContacts(array $filters = []): int {
        $sql = "SELECT COUNT(*) FROM contact_messages WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (fullname LIKE :kw OR phone LIKE :kw OR email LIKE :kw OR subject LIKE :kw OR message LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }
        if (!empty($filters['status'])) {
            $sql .= " AND status = :status";
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['user_id'])) {
            $sql .= " AND user_id = :uid";
            $params['uid'] = (int)$filters['user_id'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM contact_messages WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int {
        $sql = "INSERT INTO contact_messages (fullname, phone, email, subject, message, status, user_id)
                VALUES (:name, :phone, :email, :subj, :msg, :status, :uid)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'name'   => $data['fullname'],
            'phone'  => $data['phone'],
            'email'  => $data['email'] ?? null,
            'subj'   => $data['subject'] ?? 'Tư vấn thuê phòng',
            'msg'    => $data['message'],
            'status' => $data['status'] ?? 'new',
            'uid'    => !empty($data['user_id']) ? (int)$data['user_id'] : null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status, ?string $adminNotes = null): bool {
        $sql = "UPDATE contact_messages SET status = :status";
        $params = ['id' => $id, 'status' => $status];
        if ($adminNotes !== null) {
            $sql .= ", admin_notes = :anotes";
            $params['anotes'] = $adminNotes;
        }
        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM contact_messages WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function getByUserId(int $userId): array {
        $stmt = $this->db->prepare("SELECT * FROM contact_messages WHERE user_id = :uid ORDER BY id DESC");
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll();
    }
}

