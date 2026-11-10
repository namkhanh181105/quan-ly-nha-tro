<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: DUYỆT MINH CHỨNG CHUYỂN KHOẢN (REVIEW PAYMENT PROOF)
 * ============================================================================
 * Gọi bởi: Modal #reviewProofModal trên frontend/admin/invoices.html (Nút #btnApproveProof, #btnRejectProof)
 * Phương thức: POST
 * Dữ liệu gửi:
 * - id: ID hóa đơn
 * - action: 'approve' (Duyệt) hoặc 'reject' (Từ chối)
 * - received_amount: Số tiền thực nhận vào tài khoản ngân hàng (khi duyệt)
 * - admin_note: Ghi chú duyệt/lý do từ chối
 * Nghiệp vụ:
 * 1. Chống duyệt lặp khi bill không ở trạng thái pending.
 * 2. Xác nhận số tiền thực nhận, cập nhật công nợ và trạng thái payment_status.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../services/invoice_service.php';

requireAdmin();
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0);
$action = trim($input['action'] ?? '');
$receivedAmount = (float)($input['received_amount'] ?? 0);
$adminNote = sanitizeText($input['admin_note'] ?? '');

if ($id <= 0) {
    jsonResponse(false, 'Mã hóa đơn không hợp lệ.', null, 400);
}

if (!in_array($action, ['approve', 'reject'], true)) {
    jsonResponse(false, 'Hành động duyệt không hợp lệ.', null, 400);
}

$invoiceService = new InvoiceService();
$res = $invoiceService->reviewPaymentProof($id, $action, $receivedAmount, $adminNote);

if (!$res['success']) {
    jsonResponse(false, $res['message'], null, 400);
}

jsonResponse(true, $res['message']);

