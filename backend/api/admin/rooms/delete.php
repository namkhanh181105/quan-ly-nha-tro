<?php
/**
 * ============================================================================
 * API QUẢN TRỊ: XÓA PHÒNG TRỌ (ADMIN DELETE ROOM)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/admin/rooms.js (Nút xác nhận xóa #btnConfirmDeleteRoom trong modal xác nhận)
 * Phương thức: POST
 * Dữ liệu gửi: id (int)
 * Kiểm tra:
 * - requireAdmin()
 * - verifyCsrfToken()
 * - Chặn xóa phòng nếu đã có lịch sử hợp đồng cư dân (tenants) hoặc hóa đơn (invoices).
 * Gọi: RoomRepository::hasBusinessHistory(), RoomRepository::deleteRoom()
 * Trả về JSON: { "success": true, "message": "..." }
 */

require_once __DIR__ . '/../../../helpers/auth.php';
require_once __DIR__ . '/../../../helpers/csrf.php';
require_once __DIR__ . '/../../../repositories/room_repository.php';

requireAdmin(); /// 1. Kiểm tra session Admin, chưa đăng nhập sẽ bị chặn
verifyCsrfToken();

$input = getRequestData();
$id = (int)($input['id'] ?? 0); // 3. Lấy ID phòng và ép kiểu số nguyên an toàn

if ($id <= 0) {
    jsonResponse(false, 'Mã phòng cần xóa không hợp lệ.', null, 400);
}
//gọi hàm hasBusinessHistory kiểm tra 
$roomRepo = new RoomRepository();//backend/repositories/room_repository.php
$room = $roomRepo->getRoomById($id);

if (!$room) {
    jsonResponse(false, 'Phòng này không tồn tại trong hệ thống.', null, 404);
}

// Kiểm tra ràng buộc dữ liệu lịch sử nghiệp vụ
if ($roomRepo->hasBusinessHistory($id)) {
    jsonResponse(false, "Không thể xóa phòng {$room['room_number']} vì phòng đã có dữ liệu hợp đồng người thuê hoặc hóa đơn cần lưu trữ. Để ngưng cho thuê, bạn vui lòng chuyển trạng thái phòng sang 'Bảo trì'.", null, 400);
}

// Thực hiện xóa an toàn
$roomRepo->deleteRoom($id);

jsonResponse(true, "Đã xóa phòng {$room['room_number']} thành công.");

