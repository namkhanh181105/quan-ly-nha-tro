<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH TIN NHẮN LIÊN HỆ (ADMIN CONTACTS LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/contacts.js (Hàm loadContacts(), bộ lọc #contactFilterForm)
 * Phương thức: GET
 * Tham số lọc: keyword, status, page, limit
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/contact_repository.php';

requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword' => $_GET['keyword'] ?? '',
    'status'  => $_GET['status'] ?? ''
];

$contactRepo = new ContactRepository();
$items = $contactRepo->getContacts($filters, $limit, $offset);
$total = $contactRepo->countContacts($filters);

jsonResponse(true, 'Lấy danh sách tin nhắn liên hệ thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

