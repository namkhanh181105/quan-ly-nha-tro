<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ THÔNG BÁO (NOTIFICATION REPOSITORY)
 * ============================================================================
 * Quản lý thông báo trong bảng `notifications`.
 * tenant_id = NULL: Thông báo chung toàn khu trọ.
 * tenant_id = ID cụ thể: Thông báo riêng cho cư dân đó.
 * 
 * LƯU Ý ĐẶC BIỆT VỀ GIỚI HẠN CSDL:
 * Cột `is_read` thuộc bảng `notifications`. Đối với thông báo chung (tenant_id IS NULL),
 * hệ thống KHÔNG cập nhật is_read=1 khi một cư dân xem để tránh làm thông báo biến thành
 * đã đọc đối với tất cả cư dân khác. Chỉ cập nhật is_read đối với thông báo riêng (tenant_id cụ thể).
 */

require_once __DIR__ . '/../config/database.php';

class NotificationRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Lấy tất cả thông báo cho trang quản trị (Admin)
     */
    public function getAllNotifications(int $limit = 50, int $offset = 0): array {
        $sql = "SELECT n.*, t.fullname AS tenant_name, t.phone AS tenant_phone, r.room_number
                FROM notifications n
                LEFT JOIN tenants t ON n.tenant_id = t.id
                LEFT JOIN rooms r ON t.room_id = r.id
                ORDER BY n.id DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function countAll(): int {
        $stmt = $this->db->query("SELECT COUNT(*) FROM notifications");
        return (int)$stmt->fetchColumn();
    }

    /**
     * Lấy danh sách thông báo hiển thị cho một cư dân cụ thể
     * Gồm: Thông báo chung (tenant_id IS NULL) + Thông báo riêng của chính họ (tenant_id = :tid)
     */
    public function getNotificationsForTenant(int $tenantId): array {
        $sql = "SELECT * FROM notifications 
                WHERE tenant_id IS NULL OR tenant_id = :tid 
                ORDER BY id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['tid' => $tenantId]);
        return $stmt->fetchAll();
    }

    /**
     * Đánh dấu đã đọc cho thông báo riêng của cư dân
     */
    public function markAsReadForTenant(int $notificationId, int $tenantId): bool {
        // Chỉ cập nhật nếu đúng là thông báo riêng của cư dân này
        $sql = "UPDATE notifications SET is_read = 1 WHERE id = :id AND tenant_id = :tid";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'id'  => $notificationId,
            'tid' => $tenantId
        ]);
    }

    /**
     * Tạo mới thông báo
     */
    public function create(?int $tenantId, string $title, string $content, string $type = 'general'): int {
        $sql = "INSERT INTO notifications (tenant_id, title, content, type, is_read, created_at)
                VALUES (:tid, :title, :content, :type, 0, NOW())";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'tid'     => $tenantId,
            'title'   => $title,
            'content' => $content,
            'type'    => $type
        ]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Xóa thông báo
     */
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}

