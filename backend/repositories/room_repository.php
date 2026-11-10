<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ PHÒNG TRỌ (ROOM REPOSITORY)
 * ============================================================================
 * Truy vấn dữ liệu bảng `rooms`, `room_images`, `categories`, `locations`.
 * Thực hiện: Lấy danh sách, tìm kiếm, lọc, chi tiết, thêm, sửa, xóa phòng
 * và quản lý bộ sưu tập ảnh phòng trọ.
 */

require_once __DIR__ . '/../config/database.php';

class RoomRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    /**
     * Lấy danh sách phòng có lọc, tìm kiếm, sắp xếp và phân trang
     *
     * @param array $filters [keyword, category_id, location_id, floor, min_price, max_price, status]
     * @param string $sortBy 'price_asc', 'price_desc', 'views_desc', 'newest'
     * @param int $limit Số bản ghi trên 1 trang
     * @param int $offset Bản ghi bắt đầu
     * @return array Danh sách các phòng kèm thông tin loại phòng và khu vực
     */
    public function getRooms(array $filters = [], string $sortBy = 'newest', int $limit = 12, int $offset = 0): array {
        $sql = "SELECT r.*, 
                       r.electricity_price AS electricity_rate,
                       r.water_price AS water_rate,
                       r.image AS image_url,
                       c.name AS category_name, c.slug AS category_slug,
                       l.name AS location_name, l.city AS location_city
                FROM rooms r
                LEFT JOIN categories c ON r.category_id = c.id
                LEFT JOIN locations l ON r.location_id = l.id
                WHERE 1=1";
        $params = [];

        // 1. Lọc theo từ khóa (Tìm trong tiêu đề, số phòng, địa chỉ)
        if (!empty($filters['keyword'])) {
            $sql .= " AND (r.title LIKE :kw OR r.room_number LIKE :kw OR r.address LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }

        // 2. Lọc theo loại phòng
        if (!empty($filters['category_id'])) {
            $sql .= " AND r.category_id = :cat_id";
            $params['cat_id'] = (int)$filters['category_id'];
        }

        // 3. Lọc theo khu vực
        if (!empty($filters['location_id'])) {
            $sql .= " AND r.location_id = :loc_id";
            $params['loc_id'] = (int)$filters['location_id'];
        }

        // 4. Lọc theo tầng
        if (!empty($filters['floor'])) {
            $sql .= " AND r.floor = :floor";
            $params['floor'] = (int)$filters['floor'];
        }

        // 5. Lọc theo trạng thái phòng (available, rented, maintenance)
        if (!empty($filters['status'])) {
            $sql .= " AND r.status = :status";
            $params['status'] = $filters['status'];
        }

        // 6. Lọc theo khoảng giá
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $sql .= " AND r.price >= :min_price";
            $params['min_price'] = (float)$filters['min_price'];
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $sql .= " AND r.price <= :max_price";
            $params['max_price'] = (float)$filters['max_price'];
        }

        // Sắp xếp
        switch ($sortBy) {
            case 'price_asc':
                $sql .= " ORDER BY r.price ASC";
                break;
            case 'price_desc':
                $sql .= " ORDER BY r.price DESC";
                break;
            case 'views_desc':
                $sql .= " ORDER BY r.views DESC";
                break;
            case 'area_desc':
                $sql .= " ORDER BY r.area DESC";
                break;
            case 'newest':
            default:
                $sql .= " ORDER BY r.id DESC";
                break;
        }

        $sql .= " LIMIT :limit OFFSET :offset";

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
     * Đếm tổng số phòng khớp với điều kiện lọc để phân trang
     */
    public function countRooms(array $filters = []): int {
        $sql = "SELECT COUNT(*) FROM rooms r WHERE 1=1";
        $params = [];

        if (!empty($filters['keyword'])) {
            $sql .= " AND (r.title LIKE :kw OR r.room_number LIKE :kw OR r.address LIKE :kw)";
            $params['kw'] = '%' . trim($filters['keyword']) . '%';
        }
        if (!empty($filters['category_id'])) {
            $sql .= " AND r.category_id = :cat_id";
            $params['cat_id'] = (int)$filters['category_id'];
        }
        if (!empty($filters['location_id'])) {
            $sql .= " AND r.location_id = :loc_id";
            $params['loc_id'] = (int)$filters['location_id'];
        }
        if (!empty($filters['floor'])) {
            $sql .= " AND r.floor = :floor";
            $params['floor'] = (int)$filters['floor'];
        }
        if (!empty($filters['status'])) {
            $sql .= " AND r.status = :status";
            $params['status'] = $filters['status'];
        }
        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $sql .= " AND r.price >= :min_price";
            $params['min_price'] = (float)$filters['min_price'];
        }
        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $sql .= " AND r.price <= :max_price";
            $params['max_price'] = (float)$filters['max_price'];
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }

    /**
     * Lấy thông tin chi tiết một phòng theo ID frontend/admin/rooms.html
     */
    public function getRoomById(int $id): ?array {
        $sql = "SELECT r.*, 
                       r.electricity_price AS electricity_rate,
                       r.water_price AS water_rate,
                       r.image AS image_url,
                       c.name AS category_name, c.slug AS category_slug,
                       l.name AS location_name, l.city AS location_city
                FROM rooms r
                LEFT JOIN categories c ON r.category_id = c.id
                LEFT JOIN locations l ON r.location_id = l.id
                WHERE r.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $room = $stmt->fetch();
        return $room ?: null;
    }

    /**
     * Lấy thông tin phòng theo Slug URL
     */
    public function getRoomBySlug(string $slug): ?array {
        $sql = "SELECT r.*, 
                       c.name AS category_name, c.slug AS category_slug,
                       l.name AS location_name, l.city AS location_city
                FROM rooms r
                LEFT JOIN categories c ON r.category_id = c.id
                LEFT JOIN locations l ON r.location_id = l.id
                WHERE r.slug = :slug";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['slug' => $slug]);
        $room = $stmt->fetch();
        return $room ?: null;
    }

    /**
     * Kiểm tra số phòng (room_number) đã tồn tại hay chưa
     */
    public function checkRoomNumberExists(string $roomNumber, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM rooms WHERE room_number = :rn";
        $params = ['rn' => $roomNumber];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    /**
     * Thêm phòng trọ mới vào bảng `rooms`
     */
    public function createRoom(array $data): int {
        $sql = "INSERT INTO rooms (
                    title, floor, room_number, slug, category_id, location_id, 
                    address, price, area, electricity_price, water_price, 
                    max_occupants, image, description, amenities, status
                ) VALUES (
                    :title, :floor, :room_number, :slug, :category_id, :location_id,
                    :address, :price, :area, :electricity_price, :water_price,
                    :max_occupants, :image, :description, :amenities, :status
                )";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'title'             => $data['title'],
            'floor'             => (int)$data['floor'],
            'room_number'       => $data['room_number'],
            'slug'              => $data['slug'],
            'category_id'       => (int)$data['category_id'],
            'location_id'       => (int)$data['location_id'],
            'address'           => $data['address'],
            'price'             => (float)$data['price'],
            'area'              => (float)$data['area'],
            'electricity_price' => (float)($data['electricity_price'] ?? 3800),
            'water_price'       => (float)($data['water_price'] ?? 30000),
            'max_occupants'     => (int)($data['max_occupants'] ?? 2),
            'image'             => $data['image'] ?? 'default-room.jpg',
            'description'       => $data['description'],
            'amenities'         => $data['amenities'] ?? '',
            'status'            => $data['status'] ?? 'available'
        ]);

        return (int)$this->db->lastInsertId();
    }

    /**
     * Cập nhật thông tin phòng trọ
     * backend/api/admin/rooms/update.php
     */
    public function updateRoom(int $id, array $data): bool {
        $sql = "UPDATE rooms SET
                    title = :title,
                    floor = :floor,
                    room_number = :room_number,
                    slug = :slug,
                    category_id = :category_id,
                    location_id = :location_id,
                    address = :address,
                    price = :price,
                    area = :area,
                    electricity_price = :electricity_price,
                    water_price = :water_price,
                    max_occupants = :max_occupants,
                    description = :description,
                    amenities = :amenities,
                    status = :status";

        $params = [
            'id'                => $id,
            'title'             => $data['title'],
            'floor'             => (int)$data['floor'],
            'room_number'       => $data['room_number'],
            'slug'              => $data['slug'],
            'category_id'       => (int)$data['category_id'],
            'location_id'       => (int)$data['location_id'],
            'address'           => $data['address'],
            'price'             => (float)$data['price'],
            'area'              => (float)$data['area'],
            'electricity_price' => (float)($data['electricity_price'] ?? 3800),
            'water_price'       => (float)($data['water_price'] ?? 30000),
            'max_occupants'     => (int)($data['max_occupants'] ?? 2),
            'description'       => $data['description'],
            'amenities'         => $data['amenities'] ?? '',
            'status'            => $data['status'] ?? 'available'
        ];

        if (!empty($data['image'])) {
            $sql .= ", image = :image";
            $params['image'] = $data['image'];
        }

        $sql .= " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Cập nhật riêng trạng thái phòng
     */
    public function updateRoomStatus(int $id, string $status): bool {
        $sql = "UPDATE rooms SET status = :status WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['id' => $id, 'status' => $status]);
    }

    /**
     * Tăng số lượt xem phòng
     */
    public function incrementViews(int $id): void {
        $sql = "UPDATE rooms SET views = views + 1 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
    }

    /**
     * Kiểm tra phòng có ràng buộc dữ liệu lịch sử không (người thuê, hóa đơn)
     * Quy tắc an toàn: Không được xóa phòng nếu đã có hợp đồng thuê hoặc hóa đơn
     */
    public function hasBusinessHistory(int $roomId): bool {
        // 1. Kiểm tra xem phòng có hợp đồng thuê nào không
        $stmtT = $this->db->prepare("SELECT COUNT(*) FROM tenants WHERE room_id = :rid");
        $stmtT->execute(['rid' => $roomId]);
        if ((int)$stmtT->fetchColumn() > 0) return true;

        // 2. Kiểm tra xem phòng đã từng phát sinh hóa đơn tiền nào chưa
        $stmtI = $this->db->prepare("SELECT COUNT(*) FROM invoices WHERE room_id = :rid");
        $stmtI->execute(['rid' => $roomId]);
        if ((int)$stmtI->fetchColumn() > 0) return true;

        return false;  //không ràng buộc-> xóa deleteRoom
    }

    /**
     * Xóa phòng nếu không có lịch sử ràng buộc
     */
    public function deleteRoom(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM rooms WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    /**
     * Lấy danh sách ảnh trong bộ sưu tập của phòng (`room_images`)
     */
    public function getRoomImages(int $roomId): array {
        $stmt = $this->db->prepare("SELECT * FROM room_images WHERE room_id = :rid ORDER BY id ASC");
        $stmt->execute(['rid' => $roomId]);
        return $stmt->fetchAll();
    }

    /**
     * Thêm ảnh vào bộ sưu tập phòng
     */
    public function addRoomImage(int $roomId, string $imageUrl, string $caption = ''): int {
        $stmt = $this->db->prepare("INSERT INTO room_images (room_id, image_url, caption) VALUES (:rid, :url, :cap)");
        $stmt->execute(['rid' => $roomId, 'url' => $imageUrl, 'cap' => $caption]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Xóa một ảnh trong bộ sưu tập
     */
    public function deleteRoomImage(int $imageId): bool {
        $stmt = $this->db->prepare("DELETE FROM room_images WHERE id = :id");
        return $stmt->execute(['id' => $imageId]);
    }
}

