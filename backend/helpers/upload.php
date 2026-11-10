<?php
/**
 * ============================================================================
 * TRỢ GIÚP TẢI TỆP TIN AN TOÀN (SAFE UPLOAD HELPER)
 * ============================================================================
 * Kiểm tra mã lỗi, kích thước tệp, phần mở rộng và kiểm tra MIME type thực tế (finfo)
 * để ngăn chặn tải lên các mã thực thi độc hại (.php, .exe, .sh...).
 */

require_once __DIR__ . '/../config/app.php';

/**
 * Xử lý tải lên tệp tin ảnh hoặc tài liệu
 *
 * @param array $file Mảng $_FILES['tên_trường']
 * @param string $destinationDir Đường dẫn tuyệt đối thư mục đích
 * @param array $allowedMimes Danh sách MIME type cho phép
 * @param array $allowedExtensions Danh sách đuôi tệp cho phép
 * @param int $maxSizeBytes Kích thước tối đa cho phép (mặc định 5MB)
 * @return array ['success' => bool, 'message' => string, 'filename' => string|null]
 */
function handleFileUpload(
    array $file,
    string $destinationDir,
    array $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    array $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'],
    int $maxSizeBytes = 5242880 // 5MB
): array {
    // 1. Kiểm tra mã lỗi upload
    if (!isset($file['error']) || is_array($file['error'])) {
        return ['success' => false, 'message' => 'Dữ liệu tệp không hợp lệ.'];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE   => 'Tệp vượt quá dung lượng cho phép của máy chủ.',
            UPLOAD_ERR_FORM_SIZE  => 'Tệp vượt quá dung lượng form quy định.',
            UPLOAD_ERR_PARTIAL    => 'Tệp tải lên chưa hoàn tất.',
            UPLOAD_ERR_NO_FILE    => 'Không có tệp nào được tải lên.',
            UPLOAD_ERR_NO_TMP_DIR => 'Thiếu thư mục lưu tạm trên máy chủ.',
            UPLOAD_ERR_CANT_WRITE => 'Không thể ghi tệp vào đĩa cứng.',
            UPLOAD_ERR_EXTENSION  => 'Quá trình tải tệp bị dừng bởi tiện ích mở rộng.'
        ];
        return ['success' => false, 'message' => $errorMessages[$file['error']] ?? 'Lỗi tải tệp không xác định.'];
    }

    // 2. Kiểm tra dung lượng
    if ($file['size'] > $maxSizeBytes) {
        $maxMB = round($maxSizeBytes / (1024 * 1024), 1);
        return ['success' => false, 'message' => "Dung lượng tệp vượt quá giới hạn {$maxMB}MB."];
    }

    // 3. Kiểm tra phần mở rộng file (Extension)
    $originalName = $file['name'];
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        return ['success' => false, 'message' => 'Phần mở rộng tệp không được hỗ trợ. Chỉ chấp nhận: ' . implode(', ', $allowedExtensions)];
    }

    // 4. Kiểm tra MIME type thực tế bằng PHP Fileinfo (Chống tệp giả đuôi ảnh)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $realMime = $finfo->file($file['tmp_name']);
    if (!in_array($realMime, $allowedMimes, true)) {
        return ['success' => false, 'message' => "Loại nội dung tệp ({$realMime}) không hợp lệ hoặc bị cấm."];
    }

    // 5. Đảm bảo thư mục đích tồn tại và có quyền ghi
    if (!is_dir($destinationDir)) {
        if (!mkdir($destinationDir, 0755, true) && !is_dir($destinationDir)) {
            return ['success' => false, 'message' => 'Không thể tạo thư mục lưu trữ tệp.'];
        }
    }

    // 6. Tạo tên tệp ngẫu nhiên an toàn để tránh trùng lặp và ghi đè
    $safeFilename = bin2hex(random_bytes(10)) . '_' . time() . '.' . $extension;
    $targetFilePath = rtrim($destinationDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $safeFilename;

    // 7. Di chuyển tệp đã kiểm tra vào thư mục đích
    if (!move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        return ['success' => false, 'message' => 'Không thể lưu tệp vào máy chủ.'];
    }

    return [
        'success'  => true,
        'message'  => 'Tải tệp lên thành công.',
        'filename' => $safeFilename,
        'filepath' => $targetFilePath
    ];
}

