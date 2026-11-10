<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: CHI TIẾT HÓA ĐƠN (INVOICE DETAIL)
 * ============================================================================
 * Gọi bởi: Modal #invoiceDetailModal trên frontend/tenant/invoices.html
 * Phương thức: GET
 * Tham số: id (int)
 * Kiểm tra: Hóa đơn phải thuộc về đúng cư dân đang đăng nhập (Bảo mật quyền sở hữu).
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Thiếu mã định danh hóa đơn.', null, 400);
}

$invoiceRepo = new InvoiceRepository();
$invoice = $invoiceRepo->getById($id);

if (!$invoice || (int)$invoice['tenant_id'] !== $tenantId) {
    jsonResponse(false, 'Không tìm thấy hóa đơn hoặc bạn không có quyền xem hóa đơn này.', null, 403);
}

jsonResponse(true, 'Lấy chi tiết hóa đơn thành công.', $invoice);

