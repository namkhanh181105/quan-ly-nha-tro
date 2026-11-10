<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: TẢI MINH CHỨNG CHUYỂN KHOẢN (UPLOAD PAYMENT PROOF)
 * ============================================================================
 * Gọi bởi: Modal #uploadProofModal trên frontend/tenant/invoices.html (Nút #btnSubmitProof)
 * Phương thức: POST (FormData kèm tệp ảnh bill chuyển khoản)
 * Dữ liệu gửi:
 * - invoice_id: ID hóa đơn
 * - proof_image: Tệp ảnh ủy nhiệm chi / bill banking
 * - note: Ghi chú khi chuyển khoản
 * Nghiệp vụ:
 * 1. Kiểm tra hóa đơn thuộc về chính cư dân đang đăng nhập.
 * 2. Lưu tệp an toàn vào thư mục storage/payment_proofs/ được bảo vệ.
 * 3. Cập nhật payment_proof, payment_proof_note, payment_proof_time = NOW().
 * 4. Chuyển payment_proof_status = 'pending' (Chờ duyệt).
 * 5. KHÔNG tự động chuyển payment_status thành đã thanh toán.
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../helpers/upload.php';
require_once __DIR__ . '/../../../helpers/validation.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Phương thức không được hỗ trợ.', null, 405);
}

verifyCsrfToken();
$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$invoiceId = (int)($_POST['invoice_id'] ?? 0);
$note = sanitizeText($_POST['note'] ?? '');

if ($invoiceId <= 0) {
    jsonResponse(false, 'Mã hóa đơn không hợp lệ.', null, 400);
}

$invoiceRepo = new InvoiceRepository();
$invoice = $invoiceRepo->getById($invoiceId);

if (!$invoice || (int)$invoice['tenant_id'] !== $tenantId) {
    jsonResponse(false, 'Hóa đơn không tồn tại hoặc bạn không có quyền thao tác trên hóa đơn này.', null, 403);
}

if ($invoice['payment_status'] === 'paid') {
    jsonResponse(false, 'Hóa đơn này đã được thanh toán đầy đủ.', null, 400);
}

// Kiểm tra tệp tải lên
if (empty($_FILES['proof_image']) || $_FILES['proof_image']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(false, 'Vui lòng chọn ảnh chụp biên lai chuyển khoản (JPG, PNG, WEBP).', null, 400);
}

// Lưu vào storage/payment_proofs (Thư mục bảo mật chống truy cập trực tiếp)
$destinationDir = STORAGE_PATH . DIRECTORY_SEPARATOR . 'payment_proofs';
$uploadRes = handleFileUpload(
    $_FILES['proof_image'],
    $destinationDir,
    ['image/jpeg', 'image/png', 'image/webp'],
    ['jpg', 'jpeg', 'png', 'webp'],
    5242880 // 5MB
);

if (!$uploadRes['success']) {
    jsonResponse(false, 'Lỗi tải ảnh minh chứng: ' . $uploadRes['message'], null, 400);
}

$proofFilename = $uploadRes['filename'];

// Lưu vào CSDL
$invoiceRepo->submitPaymentProof($invoiceId, $proofFilename, $note);

jsonResponse(true, 'Đã gửi minh chứng chuyển khoản thành công! Ban quản lý sẽ đối soát và xác nhận thanh toán sớm.', [
    'proof_filename' => $proofFilename
]);

