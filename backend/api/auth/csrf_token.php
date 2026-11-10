<?php
/**
 * ============================================================================
 * API: LẤY MÃ BẢO MẬT CSRF TOKEN (CSRF TOKEN PROVIDER)
 * ============================================================================
 * Gọi bởi: frontend/assets/js/api.js khi khởi tạo hoặc trước khi submit form.
 * Phương thức: GET
 * Đầu vào: Không có.
 * Đầu ra: JSON { "success": true, "data": { "csrf_token": "..." } }
 */

require_once __DIR__ . '/../../helpers/csrf.php';

$token = getCsrfToken();
jsonResponse(true, 'Lấy CSRF token thành công.', ['csrf_token' => $token]);

