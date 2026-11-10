<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ NGƯỜI THUÊ / CƯ DÂN (TENANT REPOSITORY)
 * ============================================================================
 * Truy vấn bảng `tenants` liên kết với bảng `rooms`.
 * Hỗ trợ các nghiệp vụ quản lý cư dân, phân quyền cổng cư dân (portal_status),
 * gia hạn hợp đồng (extension_status), cập nhật hồ sơ và đổi mật khẩu.
 */

require_once __DIR__ . '/../config/database.php';

class TenantRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Lấy danh sách người thuê kèm thông tin phòng
     *
     * @param array $filters [keyword, status, room_id, portal_status, extension_status]
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function getTenants(array $filters = [], int $limit = 20, int $offset = 0): array {
        $sql = "SELECT t.*, 
                       r.room_number, r.title AS room_title, r.floor AS room_floor, r.price AS room_price
                FROM tenants t
                LEFT JOIN rooms r ON t.room_id = r.id
                WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (t.fullname LIKE :kw OR t.phone LIKE :kw OR t.id_card LIKE :kw OR t.email LIKE :kw OR r.room_number LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }

        if (!empty($filters['status'])) {
            $sql .= " AND t.status = :status";
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['room_id'])) {
            $sql .= " AND t.room_id = :room_id";
            $params['room_id'] = (int)$filters['room_id'];
        }

        if (isset($filters['portal_status']) && $filters['portal_status'] !== '') {
            $sql .= " AND t.portal_status = :portal_status";
            $params['portal_status'] = (int)$filters['portal_status'];
        }

        if (!empty($filters['extension_status'])) {
            $sql .= " AND t.extension_status = :extension_status";
            $params['extension_status'] = $filters['extension_status'];
        }

        $sql .= " ORDER BY t.id DESC LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue(':' . $k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Đếm tổng số người thuê theo bộ lọc
     */
    public function countTenants(array $filters = []): int {
        $sql = "SELECT COUNT(*) FROM tenants t LEFT JOIN rooms r ON t.room_id = r.id WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (t.fullname LIKE :kw OR t.phone LIKE :kw OR t.id_card LIKE :kw OR t.email LIKE :kw OR r.room_number LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }
        if (!empty($filters['status'])) {
            $sql .= " AND t.status = :status";
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['room_id'])) {
            $sql .= " AND t.room_id = :room_id";
            $params['room_id'] = (int)$filters['room_id'];
        }
        if (isset($filters['portal_status']) && $filters['portal_status'] !== '') {
            $sql .= " AND t.portal_status = :portal_status";
            $params['portal_status'] = (int)$filters['portal_status'];
        }
        if (!empty($filters['extension_status'])) {
            $sql .= " AND t.extension_status = :extension_status";
            $params['extension_status'] = $filters['extension_status'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Lấy thông tin người thuê theo ID
     */
    public function getById(int $id): ?array {
        $sql = "SELECT t.*, 
                       r.room_number, r.title AS room_title, r.floor AS room_floor, 
                       r.price AS room_price, r.electricity_price, r.water_price, 
                       r.address AS room_address, r.max_occupants
                FROM tenants t
                LEFT JOIN rooms r ON t.room_id = r.id
                WHERE t.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Tìm cư dân theo số điện thoại hoặc email (dùng cho đăng nhập cổng cư dân)
     */
    public function findByPhoneOrEmail(string $loginIdentifier): ?array {
        $sql = "SELECT t.*, r.room_number, r.title AS room_title
                FROM tenants t
                LEFT JOIN rooms r ON t.room_id = r.id
                WHERE (t.phone = :phone_login OR t.email = :email_login)
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'phone_login' => $loginIdentifier,
            'email_login' => $loginIdentifier
        ]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Kiểm tra người thuê đại diện đang hoạt động (active) trong phòng
     */
    public function getActiveTenantByRoomId(int $roomId, ?int $excludeTenantId = null): ?array {
        $sql = "SELECT * FROM tenants WHERE room_id = :rid AND status = 'active'";
        $params = ['rid' => $roomId];
        if ($excludeTenantId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeTenantId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Thêm mới hợp đồng người thuê
     */
    public function create(array $data): int {
        $sql = "INSERT INTO tenants (
                    room_id, fullname, phone, email, password, avatar,
                    id_card, hometown, deposit_amount, contract_start, contract_end,
                    occupant_count, vehicle_count, status, portal_status,
                    note, contract_notes, extension_status, extension_note
                ) VALUES (
                    :room_id, :fullname, :phone, :email, :password, :avatar,
                    :id_card, :hometown, :deposit_amount, :contract_start, :contract_end,
                    :occupant_count, :vehicle_count, :status, :portal_status,
                    :note, :contract_notes, :extension_status, :extension_note
                )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'room_id'          => !empty($data['room_id']) ? (int)$data['room_id'] : null,
            'fullname'         => $data['fullname'],
            'phone'            => $data['phone'],
            'email'            => $data['email'] ?? null,
            'password'         => $data['password'] ?? null,
            'avatar'           => $data['avatar'] ?? 'default-avatar.svg',
            'id_card'          => $data['id_card'] ?? null,
            'hometown'         => $data['hometown'] ?? null,
            'deposit_amount'   => (float)($data['deposit_amount'] ?? 0),
            'contract_start'   => !empty($data['contract_start']) ? $data['contract_start'] : date('Y-m-d'),
            'contract_end'     => $data['contract_end'] ?? null,
            'occupant_count'   => (int)($data['occupant_count'] ?? 1),
            'vehicle_count'    => (int)($data['vehicle_count'] ?? 1),
            'status'           => $data['status'] ?? 'active',
            'portal_status'    => isset($data['portal_status']) ? (int)$data['portal_status'] : 1,
            'note'             => $data['note'] ?? null,
            'contract_notes'   => $data['contract_notes'] ?? null,
            'extension_status' => $data['extension_status'] ?? 'none',
            'extension_note'   => $data['extension_note'] ?? null
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Cập nhật thông tin người thuê
     */
    public function update(int $id, array $data): bool {
        $sql = "UPDATE tenants SET
                    room_id = :room_id,
                    fullname = :fullname,
                    phone = :phone,
                    email = :email,
                    id_card = :id_card,
                    hometown = :hometown,
                    deposit_amount = :deposit_amount,
                    contract_start = :contract_start,
                    contract_end = :contract_end,
                    occupant_count = :occupant_count,
                    vehicle_count = :vehicle_count,
                    note = :note,
                    contract_notes = :contract_notes
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id'             => $id,
            'room_id'        => !empty($data['room_id']) ? (int)$data['room_id'] : null,
            'fullname'       => $data['fullname'],
            'phone'          => $data['phone'],
            'email'          => $data['email'] ?? null,
            'id_card'        => $data['id_card'] ?? null,
            'hometown'       => $data['hometown'] ?? null,
            'deposit_amount' => (float)($data['deposit_amount'] ?? 0),
            'contract_start' => $data['contract_start'],
            'contract_end'   => $data['contract_end'] ?? null,
            'occupant_count' => (int)($data['occupant_count'] ?? 1),
            'vehicle_count'  => (int)($data['vehicle_count'] ?? 1),
            'note'           => $data['note'] ?? null,
            'contract_notes' => $data['contract_notes'] ?? null
        ]);
    }

    /**
     * Cập nhật trạng thái kết thúc hợp đồng thuê (status = 'ended')
     */
    public function setStatus(int $id, string $status): bool {
        $stmt = $this->db->prepare("UPDATE tenants SET status = :status WHERE id = :id");
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    /**
     * Bật/tắt trạng thái Cổng cư dân (portal_status)
     */
    public function togglePortalStatus(int $id, int $newStatus): bool {
        $stmt = $this->db->prepare("UPDATE tenants SET portal_status = :ps WHERE id = :id");
        return $stmt->execute(['id' => $id, 'ps' => $newStatus]);
    }

    /**
     * Đặt lại mật khẩu đăng nhập cổng cư dân
     */
    public function resetPassword(int $id, string $passwordHash): bool {
        $stmt = $this->db->prepare("UPDATE tenants SET password = :pw WHERE id = :id");
        return $stmt->execute(['id' => $id, 'pw' => $passwordHash]);
    }

    /**
     * Cư dân gửi yêu cầu gia hạn hoặc xin trả phòng
     */
    public function updateExtensionRequest(int $id, string $status, ?string $note): bool {
        $stmt = $this->db->prepare("UPDATE tenants SET extension_status = :es, extension_note = :en WHERE id = :id");
        return $stmt->execute([
            'id' => $id,
            'es' => $status,
            'en' => $note
        ]);
    }

    /**
     * Quản trị viên xử lý yêu cầu gia hạn
     */
    public function processExtension(int $id, ?string $newEndDate, ?string $adminNote): bool {
        $sql = "UPDATE tenants SET extension_status = 'none', extension_note = NULL";
        $params = ['id' => $id];
        if (!empty($newEndDate)) {
            $sql .= ", contract_end = :cend";
            $params['cend'] = $newEndDate;
        }
        if ($adminNote !== null) {
            $sql .= ", note = CONCAT(IFNULL(note, ''), '\n[Gia hạn]: ', :anote)";
            $params['anote'] = $adminNote;
        }
        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Cập nhật thông tin hồ sơ của chính cư dân (Họ tên, quê quán, avatar)
     */
    public function updateTenantSelfProfile(int $id, string $fullname, ?string $hometown, ?string $avatar = null): bool {
        $sql = "UPDATE tenants SET fullname = :fn, hometown = :ht";
        $params = ['id' => $id, 'fn' => $fullname, 'ht' => $hometown];
        if ($avatar !== null) {
            $sql .= ", avatar = :av";
            $params['av'] = $avatar;
        }
        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Kiểm tra cư dân có hóa đơn hoặc yêu cầu sửa chữa không
     */
    public function hasInvoicesOrRequests(int $tenantId): bool {
        $stmtI = $this->db->prepare("SELECT COUNT(*) FROM invoices WHERE tenant_id = :tid");
        $stmtI->execute(['tid' => $tenantId]);
        if ((int)$stmtI->fetchColumn() > 0) return true;

        $stmtM = $this->db->prepare("SELECT COUNT(*) FROM maintenance_requests WHERE tenant_id = :tid");
        $stmtM->execute(['tid' => $tenantId]);
        if ((int)$stmtM->fetchColumn() > 0) return true;

        return false;
    }

    /**
     * Xóa hợp đồng người thuê (chỉ khi không có hóa đơn/yêu cầu ràng buộc)
     */
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM tenants WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}

