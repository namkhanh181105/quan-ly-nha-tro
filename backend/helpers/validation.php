<?php
/**
 * ============================================================================
 * KIỂM TRA VÀ LÀM SẠCH DỮ LIỆU ĐẦU VÀO (VALIDATION & SANITIZATION HELPER)
 * ============================================================================
 * Cung cấp các hàm kiểm tra ràng buộc nghiệp vụ, định dạng số, email, số điện thoại,
 * ngày tháng và lọc XSS cho nội dung văn bản / HTML mô tả phòng.
 */

/**
 * Làm sạch chuỗi văn bản thường (loại bỏ ký tự đặc biệt nguy hiểm, chống XSS)
 */
function sanitizeText(?string $str): string {
    if ($str === null) return '';
    return htmlspecialchars(trim($str), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Làm sạch HTML an toàn (cho trường description của phòng trọ)
 * Chỉ cho phép các thẻ định dạng văn bản cơ bản: <p>, <br>, <strong>, <em>, <ul>, <ol>, <li>, <span>
 * Loại bỏ triệt để các thẻ <script>, <iframe>, <object>, <embed>, on* attributes.
 */
function sanitizeHtml(?string $html): string {
    if ($html === null) return '';
    $allowedTags = '<p><br><strong><b><em><i><u><ul><ol><li><span><h1><h2><h3><h4><h5><h6><div><blockquote><hr>';
    $cleaned = strip_tags(trim($html), $allowedTags);
    // Loại bỏ thuộc tính nguy hiểm như javascript:, onload=, onclick=,...
    $cleaned = preg_replace('/<([a-z][a-z0-9]*)[^>]*?(\bon[a-z]+\s*=\s*[\'"][^\'"]*[\'"])[^>]*?>/i', '<$1>', $cleaned);
    $cleaned = preg_replace('/href\s*=\s*[\'"]\s*javascript:[^\'"]*[\'"]/i', '', $cleaned);
    return $cleaned;
}

/**
 * Kiểm tra các trường bắt buộc không được rỗng
 *
 * @param array $requiredFields Danh sách tên trường ['phone', 'fullname']
 * @param array $data Mảng dữ liệu cần kiểm tra
 * @return array Danh sách các trường bị thiếu hoặc rỗng
 */
function validateRequired(array $requiredFields, array $data): array {
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Kiểm tra định dạng Email hợp lệ
 */
function isValidEmail(string $email): bool {
    return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Kiểm tra định dạng Số điện thoại Việt Nam (10 số, đầu 03, 05, 07, 08, 09...)
 */
function isValidPhone(string $phone): bool {
    $phone = preg_replace('/\s+/', '', $phone);
    return (bool)preg_match('/^(0[35789])[0-9]{8}$/', $phone);
}

/**
 * Kiểm tra định dạng ngày YYYY-MM-DD
 */
function isValidDate(string $date, string $format = 'Y-m-d'): bool {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

/**
 * Kiểm tra giá trị thuộc tập ENUM cho phép
 */
function isValidEnum(string $value, array $allowed): bool {
    return in_array($value, $allowed, true);
}

/**
 * Tạo slug thân thiện với SEO từ tiếng Việt có dấu
 */
function createSlug(string $str): string {
    $str = mb_strtolower(trim($str), 'UTF-8');
    // Thay thế ký tự tiếng Việt có dấu
    $vietnameseMap = [
        'à'=>'a','á'=>'a','ả'=>'a','ã'=>'a','ạ'=>'a','ă'=>'a','ằ'=>'a','ắ'=>'a','ẳ'=>'a','ẵ'=>'a','ặ'=>'a',
        'â'=>'a','ầ'=>'a','ấ'=>'a','ẩ'=>'a','ẫ'=>'a','ậ'=>'a','đ'=>'d','è'=>'e','é'=>'e','ẻ'=>'e','ẽ'=>'e',
        'ẹ'=>'e','ê'=>'e','ề'=>'e','ế'=>'e','ể'=>'e','ễ'=>'e','ệ'=>'e','ì'=>'i','í'=>'i','ỉ'=>'i','ĩ'=>'i',
        'ị'=>'i','ò'=>'o','ó'=>'o','ỏ'=>'o','õ'=>'o','ọ'=>'o','ô'=>'o','ồ'=>'o','ố'=>'o','ổ'=>'o','ỗ'=>'o',
        'ộ'=>'o','ơ'=>'o','ờ'=>'o','ớ'=>'o','ở'=>'o','ỡ'=>'o','ợ'=>'o','ù'=>'u','ú'=>'u','ủ'=>'u','ũ'=>'u',
        'ụ'=>'u','ư'=>'u','ừ'=>'u','ứ'=>'u','ử'=>'u','ữ'=>'u','ự'=>'u','ỳ'=>'y','ý'=>'y','ỷ'=>'y','ỹ'=>'y',
        'ỵ'=>'y'
    ];
    $str = strtr($str, $vietnameseMap);
    // Thay thế các ký tự không phải chữ và số thành gạch ngang
    $str = preg_replace('/[^a-z0-9\-]/', '-', $str);
    $str = preg_replace('/-+/', '-', $str);
    return trim($str, '-');
}

