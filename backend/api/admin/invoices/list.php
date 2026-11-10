<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DANH SÁCH HÓA ĐƠN (ADMIN INVOICES LIST)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/invoices.js (Hàm loadInvoices(), bộ lọc #invoiceFilterForm)
 * Phương thức: GET
 * Tham số lọc:
 * - keyword, room_id, tenant_id, month, year, payment_status, payment_proof_status, page, limit
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

requireAdmin();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

$filters = [
    'keyword'              => $_GET['keyword'] ?? '',
    'room_id'              => $_GET['room_id'] ?? '',
    'tenant_id'            => $_GET['tenant_id'] ?? '',
    'month'                => $_GET['month'] ?? '',
    'year'                 => $_GET['year'] ?? '',
    'payment_status'       => $_GET['payment_status'] ?? '',
    'payment_proof_status' => $_GET['payment_proof_status'] ?? ''
];

$invoiceRepo = new InvoiceRepository();
$items = $invoiceRepo->getInvoices($filters, $limit, $offset);
$total = $invoiceRepo->countInvoices($filters);

jsonResponse(true, 'Lấy danh sách hóa đơn thành công.', [
    'items'      => $items,
    'pagination' => [
        'page'        => $page,
        'limit'       => $limit,
        'total'       => $total,
        'total_pages' => (int)ceil($total / $limit)
    ]
]);

