<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ HÓA ĐƠN TIỀN NHÀ (INVOICE REPOSITORY)
 * ============================================================================
 * Quản lý hóa đơn tiền phòng, tiền điện, tiền nước, phí dịch vụ và phụ phí.
 * Xử lý: Lập hóa đơn, ghi nhận thanh toán, gửi và duyệt minh chứng chuyển khoản.
 */

require_once __DIR__ . '/../config/database.php';

class InvoiceRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Lấy danh sách hóa đơn theo bộ lọc
     */
    public function getInvoices(array $filters = [], int $limit = 20, int $offset = 0): array {
        $sql = "SELECT i.*, 
                       r.room_number, r.title AS room_title, r.floor AS room_floor,
                       t.fullname AS tenant_name, t.phone AS tenant_phone
                FROM invoices i
                JOIN rooms r ON i.room_id = r.id
                LEFT JOIN tenants t ON i.tenant_id = t.id
                WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (i.invoice_code LIKE :kw OR r.room_number LIKE :kw OR t.fullname LIKE :kw OR t.phone LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }

        if (!empty($filters['room_id'])) {
            $sql .= " AND i.room_id = :room_id";
            $params['room_id'] = (int)$filters['room_id'];
        }

        if (!empty($filters['tenant_id'])) {
            $sql .= " AND i.tenant_id = :tenant_id";
            $params['tenant_id'] = (int)$filters['tenant_id'];
        }

        if (!empty($filters['month'])) {
            $sql .= " AND i.month = :month";
            $params['month'] = (int)$filters['month'];
        }

        if (!empty($filters['year'])) {
            $sql .= " AND i.year = :year";
            $params['year'] = (int)$filters['year'];
        }

        if (!empty($filters['payment_status'])) {
            $sql .= " AND i.payment_status = :payment_status";
            $params['payment_status'] = $filters['payment_status'];
        }

        if (!empty($filters['payment_proof_status'])) {
            $sql .= " AND i.payment_proof_status = :proof_status";
            $params['proof_status'] = $filters['payment_proof_status'];
        }

        $sql .= " ORDER BY i.id DESC LIMIT :limit OFFSET :offset";

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
     * Đếm tổng số hóa đơn theo bộ lọc
     */
    public function countInvoices(array $filters = []): int {
        $sql = "SELECT COUNT(*) FROM invoices i 
                JOIN rooms r ON i.room_id = r.id 
                LEFT JOIN tenants t ON i.tenant_id = t.id 
                WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (i.invoice_code LIKE :kw OR r.room_number LIKE :kw OR t.fullname LIKE :kw OR t.phone LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }
        if (!empty($filters['room_id'])) {
            $sql .= " AND i.room_id = :room_id";
            $params['room_id'] = (int)$filters['room_id'];
        }
        if (!empty($filters['tenant_id'])) {
            $sql .= " AND i.tenant_id = :tenant_id";
            $params['tenant_id'] = (int)$filters['tenant_id'];
        }
        if (!empty($filters['month'])) {
            $sql .= " AND i.month = :month";
            $params['month'] = (int)$filters['month'];
        }
        if (!empty($filters['year'])) {
            $sql .= " AND i.year = :year";
            $params['year'] = (int)$filters['year'];
        }
        if (!empty($filters['payment_status'])) {
            $sql .= " AND i.payment_status = :payment_status";
            $params['payment_status'] = $filters['payment_status'];
        }
        if (!empty($filters['payment_proof_status'])) {
            $sql .= " AND i.payment_proof_status = :proof_status";
            $params['proof_status'] = $filters['payment_proof_status'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Lấy chi tiết hóa đơn theo ID
     */
    public function getById(int $id): ?array {
        $sql = "SELECT i.*, 
                       r.room_number, r.title AS room_title, r.floor AS room_floor, r.address AS room_address,
                       t.fullname AS tenant_name, t.phone AS tenant_phone, t.email AS tenant_email
                FROM invoices i
                JOIN rooms r ON i.room_id = r.id
                LEFT JOIN tenants t ON i.tenant_id = t.id
                WHERE i.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Kiểm tra trùng hóa đơn cùng phòng trong cùng tháng/năm
     */
    public function checkDuplicate(int $roomId, int $month, int $year, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM invoices WHERE room_id = :rid AND month = :m AND year = :y";
        $params = ['rid' => $roomId, 'm' => $month, 'y' => $year];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Lấy hóa đơn mới nhất của phòng để tham chiếu chỉ số điện/nước cũ
     */
    public function getLatestByRoom(int $roomId): ?array {
        $sql = "SELECT * FROM invoices WHERE room_id = :rid ORDER BY year DESC, month DESC LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['rid' => $roomId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    /**
     * Tạo mới hóa đơn tiền nhà
     */
    public function create(array $data): int {
        $sql = "INSERT INTO invoices (
                    invoice_code, room_id, tenant_id, month, year, room_price,
                    old_electricity, new_electricity, electricity_usage, electricity_rate, electricity_amount,
                    old_water, new_water, water_usage, water_rate, water_amount,
                    service_amount, other_amount, total_amount, paid_amount, debt_amount,
                    payment_status, payment_date, note
                ) VALUES (
                    :invoice_code, :room_id, :tenant_id, :month, :year, :room_price,
                    :old_electricity, :new_electricity, :electricity_usage, :electricity_rate, :electricity_amount,
                    :old_water, :new_water, :water_usage, :water_rate, :water_amount,
                    :service_amount, :other_amount, :total_amount, :paid_amount, :debt_amount,
                    :payment_status, :payment_date, :note
                )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'invoice_code'       => $data['invoice_code'],
            'room_id'            => (int)$data['room_id'],
            'tenant_id'          => !empty($data['tenant_id']) ? (int)$data['tenant_id'] : null,
            'month'              => (int)$data['month'],
            'year'               => (int)$data['year'],
            'room_price'         => (float)$data['room_price'],
            'old_electricity'    => (int)$data['old_electricity'],
            'new_electricity'    => (int)$data['new_electricity'],
            'electricity_usage'  => (int)$data['electricity_usage'],
            'electricity_rate'   => (float)$data['electricity_rate'],
            'electricity_amount' => (float)$data['electricity_amount'],
            'old_water'          => (int)$data['old_water'],
            'new_water'          => (int)$data['new_water'],
            'water_usage'        => (int)$data['water_usage'],
            'water_rate'         => (float)$data['water_rate'],
            'water_amount'       => (float)$data['water_amount'],
            'service_amount'     => (float)($data['service_amount'] ?? 150000),
            'other_amount'       => (float)($data['other_amount'] ?? 0),
            'total_amount'       => (float)$data['total_amount'],
            'paid_amount'        => (float)($data['paid_amount'] ?? 0),
            'debt_amount'        => (float)$data['debt_amount'],
            'payment_status'     => $data['payment_status'] ?? 'unpaid',
            'payment_date'       => $data['payment_date'] ?? null,
            'note'               => $data['note'] ?? null
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Ghi nhận thanh toán từ Quản trị viên
     */
    public function recordPayment(int $id, float $newPaidAmount, float $newDebtAmount, string $paymentStatus, ?string $paymentDate, ?string $note): bool {
        $sql = "UPDATE invoices SET 
                    paid_amount = :paid,
                    debt_amount = :debt,
                    payment_status = :status,
                    payment_date = :pdate";
        $params = [
            'id'     => $id,
            'paid'   => $newPaidAmount,
            'debt'   => $newDebtAmount,
            'status' => $paymentStatus,
            'pdate'  => $paymentDate ?: date('Y-m-d')
        ];
        if ($note !== null) {
            $sql .= ", note = CONCAT(IFNULL(note, ''), '\n[Thanh toán]: ', :note)";
            $params['note'] = $note;
        }
        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Cư dân tải lên minh chứng chuyển khoản (Ảnh bill)
     */
    public function submitPaymentProof(int $invoiceId, string $proofFilename, ?string $note): bool {
        $sql = "UPDATE invoices SET 
                    payment_proof = :proof,
                    payment_proof_note = :note,
                    payment_proof_time = NOW(),
                    payment_proof_status = 'pending'
                WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id'    => $invoiceId,
            'proof' => $proofFilename,
            'note'  => $note
        ]);
    }

    /**
     * Quản trị viên duyệt hoặc từ chối minh chứng chuyển khoản
     */
    public function reviewPaymentProof(int $invoiceId, string $proofStatus, float $newPaidAmount, float $newDebtAmount, string $paymentStatus, ?string $adminNote = null): bool {
        $sql = "UPDATE invoices SET 
                    payment_proof_status = :pstatus,
                    paid_amount = :paid,
                    debt_amount = :debt,
                    payment_status = :pay_status";
        $params = [
            'id'         => $invoiceId,
            'pstatus'    => $proofStatus,
            'paid'       => $newPaidAmount,
            'debt'       => $newDebtAmount,
            'pay_status' => $paymentStatus
        ];

        if ($proofStatus === 'approved') {
            $sql .= ", payment_date = CURDATE()";
        }

        if ($adminNote !== null && trim($adminNote) !== '') {
            $sql .= ", note = CONCAT(IFNULL(note, ''), '\n[Duyệt bill]: ', :anote)";
            $params['anote'] = $adminNote;
        }

        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Lấy danh sách hóa đơn của riêng một cư dân (Tenant Portal)
     */
    public function getInvoicesByTenant(int $tenantId): array {
        $sql = "SELECT i.*, r.room_number, r.title AS room_title
                FROM invoices i
                JOIN rooms r ON i.room_id = r.id
                WHERE i.tenant_id = :tid
                ORDER BY i.year DESC, i.month DESC, i.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['tid' => $tenantId]);
        return $stmt->fetchAll();
    }

    /**
     * Xóa hóa đơn
     */
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM invoices WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}

