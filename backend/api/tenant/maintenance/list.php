<?php
/**
 * ============================================================================
 * API CỔNG CƯ DÂN: DANH SÁCH PHIẾU BẢO TRÌ SỬA CHỮA (MY TICKETS)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/tenant/maintenance.js (Hàm loadMyRequests())
 * Phương thức: GET
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../repositories/maintenance_repository.php';

$sessionTenant = requireTenant();
$tenantId = (int)$sessionTenant['id'];

$maintRepo = new MaintenanceRepository();
$requests = $maintRepo->getByTenantId($tenantId);

jsonResponse(true, 'Lấy danh sách yêu cầu sửa chữa thành công.', $requests);

