<?php
/**
 * ============================================================================
 * KHO LƯU TRỮ LOẠI PHÒNG (CATEGORY REPOSITORY)
 * ============================================================================
 * Truy vấn bảng `categories`.
 */

require_once __DIR__ . '/../config/database.php';

class CategoryRepository {
    private PDO $db;

    public function __construct() {
        $this->db = getDB();
    }

    public function getAll(): array {
        $stmt = $this->db->query("SELECT c.*, COUNT(r.id) AS room_count 
                                  FROM categories c 
                                  LEFT JOIN rooms r ON c.id = r.category_id 
                                  GROUP BY c.id 
                                  ORDER BY c.id ASC");
        return $stmt->fetchAll();
    }
// thông tin loại phòng tìm được
    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getBySlug(string $slug): ?array {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE slug = :slug");
        $stmt->execute(['slug' => $slug]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function checkSlugExists(string $slug, ?int $excludeId = null): bool {
        $sql = "SELECT COUNT(*) FROM categories WHERE slug = :slug";
        $params = ['slug' => $slug];
        if ($excludeId !== null) {
            $sql .= " AND id != :ex_id";
            $params['ex_id'] = $excludeId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(string $name, string $slug, ?string $description): int {
        $stmt = $this->db->prepare("INSERT INTO categories (name, slug, description) VALUES (:name, :slug, :desc)");
        $stmt->execute([
            'name' => $name,
            'slug' => $slug,
            'desc' => $description
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, string $name, string $slug, ?string $description): bool {
        $stmt = $this->db->prepare("UPDATE categories SET name = :name, slug = :slug, description = :desc WHERE id = :id");
        return $stmt->execute([
            'id'   => $id,
            'name' => $name,
            'slug' => $slug,
            'desc' => $description
        ]);
    }

    public function countRooms(int $categoryId): int {
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM rooms WHERE category_id = :cid");
        $stmt->execute(['cid' => $categoryId]);
        return (int)$stmt->fetchColumn();
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM categories WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}

