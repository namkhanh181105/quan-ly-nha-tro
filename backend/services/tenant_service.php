<?php
/**
 * ============================================================================
 * NGHIỆP VỤ QUẢN LÝ THUÊ TRỌ (TENANT SERVICE)
 * ============================================================================
 * Xử lý các quy trình nghiệp vụ nhiều bước liên quan đến người thuê:
 * 1. Gán phòng & tạo hợp đồng trong PDO Transaction (Đảm bảo tính toàn vẹn dữ liệu).
 * 2. Kiểm tra sức chứa tối đa của phòng (occupant_count <= max_occupants).
 * 3. Chống tạo nhiều hợp đồng active đại diện cùng một phòng.
 * 4. Kết thúc hợp đồng (status = ended) và hoàn trả trạng thái phòng thành 'available' an toàn.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../repositories/tenant_repository.php';
require_once __DIR__ . '/../repositories/room_repository.php';

class TenantService {
    private PDO $db;
    private TenantRepository $tenantRepo;
    private RoomRepository $roomRepo;

    public function __construct() {
        $this->db = getDB();
        $this->tenantRepo = new TenantRepository();
        $this->roomRepo = new RoomRepository();
    }

    /**
     * Tạo hợp đồng thuê phòng và tự động cập nhật trạng thái phòng thành 'rented' trong Transaction
     */
    public function assignRoomToTenant(array $data): array {
        $roomId = !empty($data['room_id']) ? (int)$data['room_id'] : null;

        if ($roomId) {
            $room = $this->roomRepo->getRoomById($roomId);
            if (!$room) {
                return ['success' => false, 'message' => 'Phòng được chọn không tồn tại trong hệ thống.'];
            }

            // 1. Kiểm tra sức chứa tối đa
            $occupantCount = (int)($data['occupant_count'] ?? 1);
            if ($room['max_occupants'] > 0 && $occupantCount > $room['max_occupants']) {
                return [
                    'success' => false, 
                    'message' => "Số người ở ({$occupantCount}) vượt quá sức chứa tối đa của phòng ({$room['max_occupants']} người)."
                ];
            }

            // 2. Chống nhiều hợp đồng active cùng đại diện một phòng
            $existingActive = $this->tenantRepo->getActiveTenantByRoomId($roomId);
            if ($existingActive) {
                return [
                    'success' => false, 
                    'message' => "Phòng {$room['room_number']} hiện đang có người thuê đại diện ({$existingActive['fullname']}). Vui lòng kết thúc hợp đồng cũ trước."
                ];
            }
        }

        // Bắt đầu Transaction
        $this->db->beginTransaction();
        try {
            // Mật khẩu mặc định nếu chưa nhập: 'tenant123'
            if (empty($data['password'])) {
                $data['password'] = password_hash('tenant123', PASSWORD_BCRYPT);
            } else {
                $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
            }

            // Tạo người thuê
            $tenantId = $this->tenantRepo->create($data);

            // Cập nhật trạng thái phòng sang 'rented' nếu có gán phòng
            if ($roomId && ($data['status'] ?? 'active') === 'active') {
                $this->roomRepo->updateRoomStatus($roomId, 'rented');
            }

            $this->db->commit();
            return [
                'success'   => true, 
                'message'   => 'Lập hợp đồng và xếp phòng thành công.', 
                'tenant_id' => $tenantId
            ];
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Lỗi xử lý giao dịch: ' . $e->getMessage()];
        }
    }

    /**
     * Kết thúc hợp đồng thuê (status = 'ended')
     * Giữ nguyên lịch sử, không xóa dữ liệu; cập nhật trạng thái phòng về 'available'
     */
    public function endTenancy(int $tenantId): array {
        $tenant = $this->tenantRepo->getById($tenantId);
        if (!$tenant) {
            return ['success' => false, 'message' => 'Hợp đồng người thuê không tồn tại.'];
        }

        if ($tenant['status'] === 'ended') {
            return ['success' => false, 'message' => 'Hợp đồng này đã kết thúc trước đó.'];
        }

        $this->db->beginTransaction();
        try {
            // 1. Cập nhật trạng thái hợp đồng thành ended
            $this->tenantRepo->setStatus($tenantId, 'ended');

            // 2. Kiểm tra xem phòng còn người thuê active nào khác không
            if (!empty($tenant['room_id'])) {
                $roomId = (int)$tenant['room_id'];
                $otherActive = $this->tenantRepo->getActiveTenantByRoomId($roomId, $tenantId);
                if (!$otherActive) {
                    // Trả phòng về trạng thái trống
                    $this->roomRepo->updateRoomStatus($roomId, 'available');
                }
            }

            $this->db->commit();
            return ['success' => true, 'message' => 'Đã kết thúc hợp đồng thuê và cập nhật trạng thái phòng thành công.'];
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Lỗi kết thúc hợp đồng: ' . $e->getMessage()];
        }
    }
}

