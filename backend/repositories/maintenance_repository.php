<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ YÊU CẦU SỬA CHỮA / BẢO TRÌ (MAINTENANCE REPOSITORY)
 * ============================================================================
 * Quản lý phiếu yêu cầu bảo trì, sự cố phòng của cư dân trong bảng `maintenance_requests`.
 */

require_once __DIR__ . '/../config/database.php';

class MaintenanceRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getRequests(array $filters = [], int $limit = 20, int $offset = 0): array {
        $sql = "SELECT mr.*, r.title AS room_title, r.floor AS room_floor
                FROM maintenance_requests mr
                LEFT JOIN rooms r ON mr.room_id = r.id
                WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (mr.ticket_code LIKE :kw OR mr.room_number LIKE :kw OR mr.tenant_name LIKE :kw OR mr.tenant_phone LIKE :kw OR mr.description LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }

        if (!empty($filters['status'])) {
            $sql .= " AND mr.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['urgency'])) {
            $sql .= " AND mr.urgency = :urgency";
            $params['urgency'] = $filters['urgency'];
        }

        if (!empty($filters['category'])) {
            $sql .= " AND mr.category = :category";
            $params['category'] = $filters['category'];
        }

        if (!empty($filters['tenant_id'])) {
            $sql .= " AND mr.tenant_id = :tid";
            $params['tid'] = (int)$filters['tenant_id'];
        }

        if (!empty($filters['room_id'])) {
            $sql .= " AND mr.room_id = :rid";
            $params['rid'] = (int)$filters['room_id'];
        }

        $sql .= " ORDER BY mr.id DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function countRequests(array $filters = []): int {
        $sql = "SELECT COUNT(*) FROM maintenance_requests mr WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (mr.ticket_code LIKE :kw OR mr.room_number LIKE :kw OR mr.tenant_name LIKE :kw OR mr.tenant_phone LIKE :kw OR mr.description LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }
        if (!empty($filters['status'])) {
            $sql .= " AND mr.status = :status";
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['urgency'])) {
            $sql .= " AND mr.urgency = :urgency";
            $params['urgency'] = $filters['urgency'];
        }
        if (!empty($filters['category'])) {
            $sql .= " AND mr.category = :category";
            $params['category'] = $filters['category'];
        }
        if (!empty($filters['tenant_id'])) {
            $sql .= " AND mr.tenant_id = :tid";
            $params['tid'] = (int)$filters['tenant_id'];
        }
        if (!empty($filters['room_id'])) {
            $sql .= " AND mr.room_id = :rid";
            $params['rid'] = (int)$filters['room_id'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    public function getById(int $id): ?array {
        $sql = "SELECT mr.*, r.title AS room_title, r.floor AS room_floor, r.address AS room_address
                FROM maintenance_requests mr
                LEFT JOIN rooms r ON mr.room_id = r.id
                WHERE mr.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(array $data): int {
        $sql = "INSERT INTO maintenance_requests (
                    tenant_id, room_id, ticket_code, room_number, tenant_name, 
                    tenant_phone, category, urgency, description, preferred_time, 
                    status, admin_notes, assigned_technician
                ) VALUES (
                    :tenant_id, :room_id, :ticket_code, :room_number, :tenant_name,
                    :tenant_phone, :category, :urgency, :description, :preferred_time,
                    :status, :admin_notes, :assigned_technician
                )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'tenant_id'           => (int)$data['tenant_id'],
            'room_id'             => (int)$data['room_id'],
            'ticket_code'         => $data['ticket_code'],
            'room_number'         => $data['room_number'],
            'tenant_name'         => $data['tenant_name'],
            'tenant_phone'        => $data['tenant_phone'],
            'category'            => $data['category'],
            'urgency'             => $data['urgency'] ?? 'normal',
            'description'         => $data['description'],
            'preferred_time'      => $data['preferred_time'] ?? null,
            'status'              => $data['status'] ?? 'pending',
            'admin_notes'         => $data['admin_notes'] ?? null,
            'assigned_technician' => $data['assigned_technician'] ?? null
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateStatus(int $id, string $status, ?string $assignedTech = null, ?string $adminNotes = null): bool {
        $sql = "UPDATE maintenance_requests SET status = :status";
        $params = ['id' => $id, 'status' => $status];

        if ($assignedTech !== null) {
            $sql .= ", assigned_technician = :tech";
            $params['tech'] = $assignedTech;
        }

        if ($adminNotes !== null) {
            $sql .= ", admin_notes = :notes";
            $params['notes'] = $adminNotes;
        }

        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function getByTenantId(int $tenantId): array {
        $sql = "SELECT * FROM maintenance_requests WHERE tenant_id = :tid ORDER BY id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['tid' => $tenantId]);
        return $stmt->fetchAll();
    }
}

