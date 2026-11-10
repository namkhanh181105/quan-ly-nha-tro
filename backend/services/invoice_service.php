<?php
/**
 * ============================================================================
 * NGHIỆP VỤ TÍNH TOÁN & XỬ LÝ HÓA ĐƠN (INVOICE SERVICE)
 * ============================================================================
 * Thực hiện công thức tính toán tài chính chính xác tuyệt đối tại Backend:
 * - Tiền điện = (chỉ số cuối − chỉ số đầu) × đơn giá điện
 * - Tiền nước = (chỉ số cuối − chỉ số đầu) × đơn giá nước
 * - Tổng tiền = tiền phòng + điện + nước + dịch vụ + phụ phí
 * - Còn nợ    = tổng tiền − đã thanh toán
 * - Kiểm tra chặn chỉ số sai, tiền âm, thanh toán vượt tổng và trùng hóa đơn.
 * - Duyệt minh chứng chuyển khoản: Xác nhận số tiền thực nhận, chống duyệt lặp.
 */

require_once __DIR__ . '/../repositories/invoice_repository.php';
require_once __DIR__ . '/../repositories/room_repository.php';
require_once __DIR__ . '/../repositories/tenant_repository.php';

class InvoiceService {
    private InvoiceRepository $invoiceRepo;
    private RoomRepository $roomRepo;
    private TenantRepository $tenantRepo;

    public function __construct() {
        $this->invoiceRepo = new InvoiceRepository();
        $this->roomRepo = new RoomRepository();
        $this->tenantRepo = new TenantRepository();
    }

    /**
     * Chuẩn bị và kiểm tra tính toán dữ liệu hóa đơn trước khi lưu
     */
    public function calculateAndValidate(array $raw): array {
        $roomId = (int)($raw['room_id'] ?? 0);
        $month = (int)($raw['month'] ?? 0);
        $year = (int)($raw['year'] ?? 0);

        if ($roomId <= 0) {
            return ['success' => false, 'message' => 'Vui lòng chọn phòng cần lập hóa đơn.'];
        }
        if ($month < 1 || $month > 12) {
            return ['success' => false, 'message' => 'Tháng thu tiền không hợp lệ (1 - 12).'];
        }
        if ($year < 2020 || $year > 2099) {
            return ['success' => false, 'message' => 'Năm thu tiền không hợp lệ.'];
        }

        // 1. Kiểm tra trùng hóa đơn cùng phòng/tháng/năm
        $excludeId = !empty($raw['id']) ? (int)$raw['id'] : null;
        if ($this->invoiceRepo->checkDuplicate($roomId, $month, $year, $excludeId)) {
            return ['success' => false, 'message' => "Phòng này đã có hóa đơn cho tháng {$month}/{$year}. Không được lập trùng."];
        }

        // 2. Lấy thông tin phòng và người thuê hiện tại
        $room = $this->roomRepo->getRoomById($roomId);
        if (!$room) {
            return ['success' => false, 'message' => 'Không tìm thấy thông tin phòng.'];
        }

        $activeTenant = $this->tenantRepo->getActiveTenantByRoomId($roomId);
        $tenantId = !empty($raw['tenant_id']) ? (int)$raw['tenant_id'] : ($activeTenant['id'] ?? null);

        // 3. Tiền phòng
        $roomPrice = isset($raw['room_price']) && is_numeric($raw['room_price']) 
            ? (float)$raw['room_price'] 
            : (float)$room['price'];
        if ($roomPrice < 0) {
            return ['success' => false, 'message' => 'Tiền phòng không được là số âm.'];
        }

        // 4. Chỉ số và tiền điện
        $oldElec = (int)($raw['old_electricity'] ?? 0);
        $newElec = (int)($raw['new_electricity'] ?? 0);
        if ($oldElec < 0 || $newElec < 0) {
            return ['success' => false, 'message' => 'Chỉ số điện không được âm.'];
        }
        if ($newElec < $oldElec) {
            return ['success' => false, 'message' => "Chỉ số điện mới ({$newElec}) không được nhỏ hơn chỉ số cũ ({$oldElec})."];
        }
        $elecUsage = $newElec - $oldElec;
        $elecRate = isset($raw['electricity_rate']) && is_numeric($raw['electricity_rate']) 
            ? (float)$raw['electricity_rate'] 
            : (float)$room['electricity_price'];
        if ($elecRate < 0) return ['success' => false, 'message' => 'Đơn giá điện không được âm.'];
        $elecAmount = $elecUsage * $elecRate;

        // 5. Chỉ số và tiền nước
        $oldWater = (int)($raw['old_water'] ?? 0);
        $newWater = (int)($raw['new_water'] ?? 0);
        if ($oldWater < 0 || $newWater < 0) {
            return ['success' => false, 'message' => 'Chỉ số nước không được âm.'];
        }
        if ($newWater < $oldWater) {
            return ['success' => false, 'message' => "Chỉ số nước mới ({$newWater}) không được nhỏ hơn chỉ số cũ ({$oldWater})."];
        }
        $waterUsage = $newWater - $oldWater;
        $waterRate = isset($raw['water_rate']) && is_numeric($raw['water_rate']) 
            ? (float)$raw['water_rate'] 
            : (float)$room['water_price'];
        if ($waterRate < 0) return ['success' => false, 'message' => 'Đơn giá nước không được âm.'];
        $waterAmount = $waterUsage * $waterRate;

        // 6. Phí dịch vụ và phụ phí
        $serviceAmount = isset($raw['service_amount']) && is_numeric($raw['service_amount']) 
            ? (float)$raw['service_amount'] 
            : 150000;
        $otherAmount = isset($raw['other_amount']) && is_numeric($raw['other_amount']) 
            ? (float)$raw['other_amount'] 
            : 0;
        if ($serviceAmount < 0 || $otherAmount < 0) {
            return ['success' => false, 'message' => 'Phí dịch vụ và phụ phí không được là số âm.'];
        }

        // 7. Tổng số tiền phải thu
        $totalAmount = $roomPrice + $elecAmount + $waterAmount + $serviceAmount + $otherAmount;

        // 8. Đã thanh toán và công nợ còn lại
        $paidAmount = isset($raw['paid_amount']) && is_numeric($raw['paid_amount']) 
            ? (float)$raw['paid_amount'] 
            : 0;
        if ($paidAmount < 0) {
            return ['success' => false, 'message' => 'Số tiền đã thanh toán không được âm.'];
        }
        if ($paidAmount > $totalAmount) {
            return ['success' => false, 'message' => 'Số tiền đã thanh toán không được vượt quá tổng tiền hóa đơn.'];
        }

        $debtAmount = $totalAmount - $paidAmount;

        // 9. Xác định payment_status chuẩn xác
        if ($paidAmount >= $totalAmount && $totalAmount > 0) {
            $paymentStatus = 'paid';
        } elseif ($paidAmount > 0) {
            $paymentStatus = 'partially_paid';
        } else {
            $paymentStatus = 'unpaid';
        }

        // 10. Tạo mã hóa đơn: HD-YYYYMM-ROOM
        $formattedMonth = str_pad((string)$month, 2, '0', STR_PAD_LEFT);
        $invoiceCode = "HD-{$year}{$formattedMonth}-" . preg_replace('/[^a-zA-Z0-9]/', '', $room['room_number']);

        return [
            'success' => true,
            'data' => [
                'invoice_code'       => $invoiceCode,
                'room_id'            => $roomId,
                'tenant_id'          => $tenantId,
                'month'              => $month,
                'year'               => $year,
                'room_price'         => $roomPrice,
                'old_electricity'    => $oldElec,
                'new_electricity'    => $newElec,
                'electricity_usage'  => $elecUsage,
                'electricity_rate'   => $elecRate,
                'electricity_amount' => $elecAmount,
                'old_water'          => $oldWater,
                'new_water'          => $newWater,
                'water_usage'        => $waterUsage,
                'water_rate'         => $waterRate,
                'water_amount'       => $waterAmount,
                'service_amount'     => $serviceAmount,
                'other_amount'       => $otherAmount,
                'total_amount'       => $totalAmount,
                'paid_amount'        => $paidAmount,
                'debt_amount'        => $debtAmount,
                'payment_status'     => $paymentStatus,
                'payment_date'       => !empty($raw['payment_date']) ? $raw['payment_date'] : ($paymentStatus === 'paid' ? date('Y-m-d') : null),
                'note'               => $raw['note'] ?? null
            ]
        ];
    }

    /**
     * Duyệt hoặc từ chối minh chứng chuyển khoản (Bill thanh toán)
     * Có xác nhận số tiền thực nhận và chống duyệt lặp
     */
    public function reviewPaymentProof(int $invoiceId, string $action, float $receivedAmount = 0, ?string $adminNote = null): array {
        $invoice = $this->invoiceRepo->getById($invoiceId);
        if (!$invoice) {
            return ['success' => false, 'message' => 'Hóa đơn không tồn tại.'];
        }

        if ($invoice['payment_proof_status'] !== 'pending') {
            return [
                'success' => false, 
                'message' => "Hóa đơn này hiện có trạng thái bill là '{$invoice['payment_proof_status']}', không thể duyệt lặp lại."
            ];
        }

        if ($action === 'approve') {
            if ($receivedAmount <= 0) {
                return ['success' => false, 'message' => 'Vui lòng nhập số tiền thực nhận lớn hơn 0 để duyệt thanh toán.'];
            }

            $currentPaid = (float)$invoice['paid_amount'];
            $totalAmount = (float)$invoice['total_amount'];
            $newPaid = $currentPaid + $receivedAmount;

            if ($newPaid > $totalAmount) {
                return ['success' => false, 'message' => 'Số tiền thực nhận làm tổng thanh toán vượt quá tổng tiền hóa đơn.'];
            }

            $newDebt = $totalAmount - $newPaid;
            $newPaymentStatus = ($newDebt <= 0) ? 'paid' : 'partially_paid';

            $note = "Đã duyệt minh chứng. Xác nhận thực nhận: " . number_format($receivedAmount, 0, ',', '.') . " VNĐ.";
            if (!empty($adminNote)) {
                $note .= " Ghi chú: " . $adminNote;
            }

            $this->invoiceRepo->reviewPaymentProof($invoiceId, 'approved', $newPaid, $newDebt, $newPaymentStatus, $note);

            return [
                'success' => true, 
                'message' => 'Đã duyệt minh chứng thanh toán và cập nhật công nợ hóa đơn thành công.'
            ];
        } elseif ($action === 'reject') {
            $note = "Từ chối minh chứng thanh toán.";
            if (!empty($adminNote)) {
                $note .= " Lý do: " . $adminNote;
            }

            $this->invoiceRepo->reviewPaymentProof(
                $invoiceId, 
                'rejected', 
                (float)$invoice['paid_amount'], 
                (float)$invoice['debt_amount'], 
                $invoice['payment_status'], 
                $note
            );

            return [
                'success' => true, 
                'message' => 'Đã từ chối minh chứng chuyển khoản.'
            ];
        }

        return ['success' => false, 'message' => 'Thao tác xét duyệt không hợp lệ.'];
    }
}

