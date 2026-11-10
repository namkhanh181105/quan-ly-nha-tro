<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: GHI NHẬN THANH TOÁN HÓA ĐƠN (RECORD INVOICE PAYMENT)
 * ============================================================================
 * Gọi bởi: Modal #paymentModal trên frontend/admin/invoices.html (Nút #btnSavePayment)
 * Phương thức: POST
 * Dữ liệu gửi:
 * - id: ID hóa đơn
 * - amount: Số tiền thanh toán thêm (VNĐ)
 * - payment_date: Ngày thanh toán
 * - note: Ghi chú phiếu thu
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$amount = (float)($input['amount'] ?? 0);
$paymentDate = trim($input['payment_date'] ?? date('Y-m-d'));
$note = sanitizeText($input['note'] ?? '');

if ($id <= 0) {
    jsonResponse(false, 'Mã hóa đơn không hợp lệ.', null, 400);
}

if ($amount <= 0) {
    jsonResponse(false, 'Số tiền thanh toán phải lớn hơn 0.', null, 400);
}

$invoiceRepo = new InvoiceRepository();
$invoice = $invoiceRepo->getById($id);

if (!$invoice) {
    jsonResponse(false, 'Hóa đơn không tồn tại.', null, 404);
}

$currentPaid = (float)$invoice['paid_amount'];
$totalAmount = (float)$invoice['total_amount'];
$newPaid = $currentPaid + $amount;

if ($newPaid > $totalAmount) {
    jsonResponse(false, 'Số tiền thanh toán làm tổng tiền đã nộp vượt quá tổng tiền hóa đơn.', null, 400);
}

$newDebt = $totalAmount - $newPaid;
$paymentStatus = ($newDebt <= 0) ? 'paid' : 'partially_paid';

$invoiceRepo->recordPayment($id, $newPaid, $newDebt, $paymentStatus, $paymentDate, $note);

jsonResponse(true, "Đã ghi nhận thanh toán " . number_format($amount, 0, ',', '.') . " VNĐ cho hóa đơn {$invoice['invoice_code']}.");

