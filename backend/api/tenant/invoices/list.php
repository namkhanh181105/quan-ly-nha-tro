<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: DANH SÁCH HÓA ĐƠN TIỀN NHÀ (MY INVOICES)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/invoices.js (Hàm loadMyInvoices())
 * Phương thức: GET
 * Trả về: Toàn bộ hóa đơn tiền phòng/điện nước của cư dân đang đăng nhập
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/invoice_repository.php';

$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$invoiceRepo = new InvoiceRepository();
$invoices = $invoiceRepo->getInvoicesByTenant($tenantId);

jsonResponse(true, 'Lấy danh sách hóa đơn thành công.', $invoices);

