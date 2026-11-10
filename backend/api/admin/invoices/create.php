<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: LẬP HÓA ĐƠN TIỀN NHÀ MỚI (CREATE INVOICE)
 * ============================================================================
 * Gọi bởi: Modal #invoiceModal trên frontend/admin/invoices.html (Nút #btnSaveInvoice)
 * Phương thức: POST
 * Dữ liệu gửi:
 * - room_id, month, year, room_price, old_electricity, new_electricity, electricity_rate,
 *   old_water, new_water, water_rate, service_amount, other_amount, paid_amount, note
 * Nghiệp vụ:
 * 1. Tính toán chuẩn xác tại backend bằng InvoiceService.
 * 2. Kiểm tra chặn chỉ số sai, tiền âm, thanh toán vượt tổng và trùng hóa đơn.
 * 3. Ghi vào bảng `invoices`.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../services/invoice_service.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

requireAdmin();
verifyCsrfToken();

$raw = getRequestData();
$invoiceService = new InvoiceService();
$calc = $invoiceService->calculateAndValidate($raw);

if (!$calc['success']) {
    jsonResponse(false, $calc['message'], null, 400);
}

$invoiceRepo = new InvoiceRepository();
$invoiceId = $invoiceRepo->create($calc['data']);

jsonResponse(true, "Lập hóa đơn {$calc['data']['invoice_code']} thành công!", [
    'invoice_id'   => $invoiceId,
    'invoice_code' => $calc['data']['invoice_code']
], 201);

