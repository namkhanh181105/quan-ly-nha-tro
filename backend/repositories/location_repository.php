<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ KHU VỰC (LOCATION REPOSITORY)
 * ============================================================================
 * Truy vấn bảng `locations`.
 */

require_once __DIR__ . '/../config/database.php';

class LocationRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT l.*, COUNT(r.id) AS room_count 
                                  FROM locations l 
                                  LEFT JOIN rooms r ON l.id = r.location_id 
                                  GROUP BY l.id 
                                  ORDER BY l.id ASC");
        return $stmt->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM locations WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function checkSlugExists(string $slug, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM locations WHERE slug = :slug";
        $params = ['slug' => $slug];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(string $name, string $slug, string $city = 'Hà Nội'): int {
        $stmt = $this->db->prepare("INSERT INTO locations (name, slug, city) VALUES (:name, :slug, :city)");
        $stmt->execute([
            'name' => $name,
            'slug' => $slug,
            'city' => $city
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, string $name, string $slug, string $city): bool {
        $stmt = $this->db->prepare("UPDATE locations SET name = :name, slug = :slug, city = :city WHERE id = :id");
        return $stmt->execute([
            'id'   => $id,
            'name' => $name,
            'slug' => $slug,
            'city' => $city
        ]);
    }

    public function countRooms(int $locationId): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM rooms WHERE location_id = :lid");
        $stmt->execute(['lid' => $locationId]);
        return (int)$stmt->fetchColumn();
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM locations WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}

