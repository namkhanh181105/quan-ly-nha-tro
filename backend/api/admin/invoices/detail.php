<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: CHI TIẾT HÓA ĐƠN (INVOICE DETAIL)
 * ============================================================================
 * Gọi bởi: Modal xem hóa đơn trên frontend/admin/invoices.html
 * Phương thức: GET
 * Tham số: id (int)
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

requireAdmin();

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Mã hóa đơn không hợp lệ.', null, 400);
}

$invoiceRepo = new InvoiceRepository();
$invoice = $invoiceRepo->getById($id);

if (!$invoice) {
    jsonResponse(false, 'Không tìm thấy hóa đơn.', null, 404);
}

jsonResponse(true, 'Lấy chi tiết hóa đơn thành công.', $invoice);

