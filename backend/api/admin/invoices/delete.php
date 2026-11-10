<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA HÓA ĐƠN (DELETE INVOICE)
 * ============================================================================
 * Gọi bởi: Nút xác nhận xóa hóa đơn trên frontend/admin/invoices.html
 * Phương thức: POST
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Mã hóa đơn không hợp lệ.', null, 400);
}

$invoiceRepo = new InvoiceRepository();
$invoice = $invoiceRepo->getById($id);

if (!$invoice) {
    jsonResponse(false, 'Hóa đơn không tồn tại.', null, 404);
}

if ($invoice['payment_status'] === 'paid') {
    jsonResponse(false, 'Không thể xóa hóa đơn đã hoàn tất thanh toán.', null, 400);
}

$invoiceRepo->delete($id);

jsonResponse(true, "Đã xóa hóa đơn {$invoice['invoice_code']} thành công.");

