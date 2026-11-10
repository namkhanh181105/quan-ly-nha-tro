# HỆ THỐNG QUẢN LÝ NHÀ TRỌ & CĂN HỘ MINI (CCMN)

> Dự án website Quản lý Nhà trọ và Cổng Cư dân hoàn chỉnh, tuân thủ kiến trúc tách biệt Frontend (.html) và Backend (.php API), kết nối cơ sở dữ liệu MySQL bằng PHP Data Objects (PDO) Prepared Statements và Fetch API.

---

## 1. TỔNG QUAN HỆ THỐNG & CÔNG NGHỆ

### 1.1. Công nghệ sử dụng
- **Backend**: PHP 8.x thuần, không sử dụng bất kỳ framework nào.
- **Database**: MySQL / MariaDB, kết nối bằng **PDO**, 100% truy vấn dùng **Prepared Statements** chống SQL Injection.
- **Frontend**: HTML5, CSS3, Bootstrap 5.3.2, Bootstrap Icons, JavaScript thuần (Fetch API, Async/Await).
- **Kiến trúc phân tách**:
  - Giao diện người dùng sử dụng file thuần `.html`, không chứa mã PHP hay truy vấn SQL.
  - Phía backend là các API trả về định dạng chuẩn **JSON** (`{ "success": bool, "message": string, "data": ... }`).
  - Các thành phần giao diện dùng chung (header, footer, sidebar) được nạp động từ thư mục `frontend/components/` thông qua `components.js`.
  - Môi trường chạy chuẩn: **XAMPP** (Apache + MariaDB).

### 1.2. Tuân thủ toàn vẹn Cơ sở dữ liệu (`ql_nhatro_full_latest.sql`)
Hệ thống sử dụng đúng 12 bảng dữ liệu gốc theo đề bài, không thêm/xóa/đổi tên bảng hoặc cột:
1. `admins`: Ban quản lý tòa nhà, phân quyền `superadmin` / `admin`.
2. `users`: Khách hàng thành viên đăng ký qua website.
3. `categories`: Danh mục / Loại phòng (Phòng đơn, Phòng đôi, Studio...).
4. `locations`: Khu vực / Chi nhánh / Tòa nhà.
5. `rooms`: Thông tin chi tiết phòng (diện tích, giá thuê, tầng, sức chứa, đơn giá điện, đơn giá nước, trạng thái).
6. `room_images`: Album ảnh chụp thực tế của từng căn phòng.
7. `bookings`: Lịch hẹn xem phòng trực tiếp của khách.
8. `contact_messages`: Tin nhắn liên hệ, thắc mắc gửi tới Ban Quản Lý.
9. `tenants`: Hợp đồng cư dân, giá cọc, ngày bắt đầu/kết thúc, tài sản bàn giao, tài khoản Cổng Cư Dân.
10. `invoices`: Hóa đơn tiền phòng, chỉ số điện nước, phí dịch vụ, công nợ và minh chứng chuyển khoản.
11. `maintenance_requests`: Yêu cầu báo hỏng, sửa chữa đồ đạc, chi phí bảo trì.
12. `notifications`: Bảng tin thông báo chung toàn tòa nhà và thông báo riêng cho từng phòng/cư dân.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```
ql_nhatro/
├── frontend/
│   ├── public/                           # Giao diện công khai
│   │   ├── index.html                    # Trang chủ hệ thống & tìm kiếm nhanh
│   │   ├── rooms.html                    # Danh sách phòng trọ, bộ lọc đa tiêu chí & phân trang
│   │   ├── room-detail.html              # Chi tiết phòng, slider ảnh & form đặt lịch hẹn
│   │   ├── contact.html                  # Thông tin liên hệ & form gửi thắc mắc
│   │   ├── login.html                    # Đăng nhập tài khoản khách hàng (users)
│   │   └── register.html                 # Đăng ký tài khoản khách hàng mới
│   ├── customer/                         # Phân hệ khách hàng (users)
│   │   ├── profile.html                  # Xem/sửa thông tin cá nhân & đổi mật khẩu khách
│   │   └── bookings.html                 # Danh sách lịch hẹn xem phòng & liên hệ đã gửi
│   ├── admin/                            # Phân hệ Ban Quản Lý (admins)
│   │   ├── login.html                    # Đăng nhập quản trị viên
│   │   ├── dashboard.html                # Bảng số liệu thống kê doanh thu, phòng, cư dân
│   │   ├── rooms.html                    # Quản lý danh sách phòng & album ảnh
│   │   ├── categories.html               # Quản lý loại phòng
│   │   ├── locations.html                # Quản lý khu vực / tòa nhà
│   │   ├── tenants.html                  # Quản lý người thuê & cấp quyền Cổng Cư Dân
│   │   ├── invoices.html                 # Lập hóa đơn, thu tiền & duyệt ảnh chuyển khoản
│   │   ├── bookings.html                 # Tiếp nhận & xác nhận lịch xem phòng
│   │   ├── contacts.html                 # Quản lý tin nhắn liên hệ
│   │   ├── maintenance.html              # Tiếp nhận & cập nhật xử lý sự cố báo hỏng
│   │   ├── notifications.html            # Phát thông báo chung hoặc gửi riêng cư dân
│   │   └── accounts.html                 # Quản trị viên & phân quyền (Superadmin)
│   ├── tenant/                           # Phân hệ Cổng Cư Dân (tenants)
│   │   ├── login.html                    # Đăng nhập Cổng Cư Dân
│   │   ├── dashboard.html                # Tổng quan phòng ở, công nợ & cảnh báo hóa đơn
│   │   ├── profile.html                  # Xem/sửa thông tin cá nhân, CCCD, biển số xe
│   │   ├── contract.html                 # Xem hợp đồng, biên bản bàn giao, xin gia hạn/trả phòng
│   │   ├── invoices.html                 # Lịch sử hóa đơn & tải lên minh chứng chuyển khoản
│   │   ├── maintenance.html              # Tạo phiếu báo hỏng thiết bị & theo dõi xử lý
│   │   └── notifications.html            # Xem thông báo tòa nhà & đánh dấu đã đọc
│   ├── components/                       # Header, Sidebar, Footer dùng chung
│   │   ├── public-header.html
│   │   ├── public-footer.html
│   │   ├── admin-sidebar.html
│   │   ├── admin-header.html
│   │   ├── tenant-sidebar.html
│   │   └── tenant-header.html
│   └── assets/
│       ├── css/
│       │   ├── common.css                # Style chung toàn hệ thống
│       │   ├── public.css                # Giao diện trang công khai & khách hàng
│       │   ├── admin.css                 # Giao diện trang quản trị BQL
│       │   └── tenant.css                # Giao diện Cổng Cư Dân
│       ├── js/
│       │   ├── config.js                 # Cấu hình BASE_URL tự động & hàm format
│       │   ├── api.js                    # Fetch API wrapper kèm CSRF Token & Loader
│       │   ├── components.js             # Nạp header/sidebar động & active menu
│       │   ├── public/
│       │   │   ├── home.js
│       │   │   ├── rooms.js
│       │   │   ├── room-detail.js
│       │   │   ├── contact.js
│       │   │   └── auth.js
│       │   ├── customer/
│       │   │   ├── profile.js
│       │   │   └── bookings.js
│       │   ├── admin/
│       │   │   ├── auth.js
│       │   │   ├── dashboard.js
│       │   │   ├── rooms.js
│       │   │   ├── categories.js
│       │   │   ├── locations.js
│       │   │   ├── tenants.js
│       │   │   ├── invoices.js
│       │   │   ├── bookings.js
│       │   │   ├── contacts.js
│       │   │   ├── maintenance.js
│       │   │   ├── notifications.js
│       │   │   └── accounts.js
│       │   └── tenant/
│       │       ├── auth.js
│       │       ├── dashboard.js
│       │       ├── profile.js
│       │       ├── contract.js
│       │       ├── invoices.js
│       │       ├── maintenance.js
│       │       └── notifications.js
│       └── images/                       # Ảnh mặc định hệ thống
├── backend/
│   ├── config/
│   │   ├── app.php                       # Base URL động, Timezone, Session
│   │   └── database.php                  # PDO Singleton kết nối CSDL MySQL
│   ├── helpers/
│   │   ├── auth.php                      # Kiểm tra phiên làm việc & phân quyền
│   │   ├── csrf.php                      # Tạo & kiểm tra CSRF Token bảo vệ POST/PUT/DELETE
│   │   ├── response.php                  # Chuẩn hóa JSON phản hồi
│   │   ├── validation.php                # Lọc dữ liệu, kiểm tra Regex, XSS cleaner
│   │   └── upload.php                    # Kiểm tra MIME type finfo, kích thước & lưu file
│   ├── repositories/                     # Tầng truy vấn CSDL qua PDO
│   │   ├── admin_repository.php
│   │   ├── booking_repository.php
│   │   ├── category_repository.php
│   │   ├── contact_repository.php
│   │   ├── invoice_repository.php
│   │   ├── location_repository.php
│   │   ├── maintenance_repository.php
│   │   ├── notification_repository.php
│   │   ├── room_repository.php
│   │   ├── tenant_repository.php
│   │   └── user_repository.php
│   ├── services/                         # Tầng nghiệp vụ giao dịch nhiều bước
│   │   ├── invoice_service.php           # Công thức tính tiền, công nợ, duyệt biên lai
│   │   └── tenant_service.php            # Transaction gán phòng & kết thúc hợp đồng
│   └── api/                              # Tầng Endpoint nhận yêu cầu HTTP
│       ├── auth/                         # Đăng nhập, đăng ký, đăng xuất, kiểm tra session
│       ├── public/                       # API công khai cho khách xem phòng
│       ├── customer/                     # API quản lý hồ sơ khách hàng
│       ├── admin/                        # API nghiệp vụ Ban Quản Lý
│       ├── tenant/                       # API nghiệp vụ Cổng Cư Dân
│       └── storage/
│           └── view_proof.php            # Xuất ảnh biên lai an toàn có kiểm tra quyền
├── database/
│   └── ql_nhatro_full_latest.sql         # File cơ sở dữ liệu gốc
├── uploads/                              # Thư mục lưu ảnh công khai
│   ├── rooms/                            # Ảnh phòng trọ
│   └── avatars/                          # Ảnh đại diện người dùng
├── storage/                              # Thư mục lưu trữ bảo mật
│   └── payment_proofs/                   # Ảnh minh chứng chuyển khoản (có .htaccess bảo vệ)
├── index.php                             # Điểm vào điều hướng tới frontend/public/index.html
└── README.md                             # Tài liệu kỹ thuật dự án
```

---

## 3. HƯỚNG DẪN CÀI ĐẶT & CHẠY TRÊN XAMPP

### Bước 1: Sao chép mã nguồn vào thư mục XAMPP
- Di chuyển toàn bộ thư mục dự án vào thư mục `htdocs` của XAMPP, ví dụ:
  `C:\xampp\htdocs\ql_nhatro` (hoặc đặt alias VirtualHost nếu dùng thư mục `d:\duan`).

### Bước 2: Khởi động Apache và MySQL
- Mở **XAMPP Control Panel**.
- Bấm **Start** tại 2 dịch vụ: **Apache** và **MySQL**.

### Bước 3: Nhập Cơ sở Dữ liệu MySQL
1. Mở trình duyệt và truy cập trang phpMyAdmin: `http://localhost/phpmyadmin/`.
2. Tạo mới một cơ sở dữ liệu có tên: `ql_nhatro` (Bảng mã: `utf8mb4_unicode_ci`).
3. Chọn tab **Import** (Nhập), chọn tệp tin: `database/ql_nhatro_full_latest.sql` (hoặc tại thư mục gốc `ql_nhatro_full_latest.sql`).
4. Bấm **Import** và chờ thông báo thành công.

*Hoặc thực hiện bằng dòng lệnh (Command Prompt/PowerShell):*
```powershell
C:\xampp\mysql\bin\mysql.exe -u root -p -e "CREATE DATABASE IF NOT EXISTS ql_nhatro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
C:\xampp\mysql\bin\mysql.exe -u root -p ql_nhatro < "C:\xampp\htdocs\ql_nhatro\database\ql_nhatro_full_latest.sql"
```

### Bước 4: Kiểm tra cấu hình kết nối CSDL
- Mở tệp `backend/config/database.php` và kiểm tra thông số (mặc định của XAMPP):
  ```php
  define('DB_HOST', 'localhost');
  define('DB_PORT', '3306');
  define('DB_NAME', 'ql_nhatro');
  define('DB_USER', 'root');
  define('DB_PASS', '');
  ```

### Bước 5: Truy cập Website
- Mở trình duyệt web bất kỳ:
  - Trang chủ công khai: `http://localhost/ql_nhatro/`
  - Đăng nhập Cổng Quản Trị: `http://localhost/ql_nhatro/frontend/admin/login.html`
  - Đăng nhập Cổng Cư Dân: `http://localhost/ql_nhatro/frontend/tenant/login.html`
  - Đăng nhập Khách Hàng: `http://localhost/ql_nhatro/frontend/public/login.html`

---

## 4. DANH SÁCH TÀI KHOẢN MẪU CÓ SẴN TRONG CSDL

| Phân hệ | Đường dẫn đăng nhập | Tên đăng nhập / Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `frontend/admin/login.html` | `admin` | `admin123` | **Superadmin** (Toàn quyền quản trị) |
| **Quản trị viên** | `frontend/admin/login.html` | `quanly1` | `admin123` | **Admin** (Quản lý phòng, hóa đơn) |
| **Cư dân tòa nhà** | `frontend/tenant/login.html` | `tenant1@thongnhat.vn` | `tenant123` | Cư dân Phòng 101 |
| **Cư dân tòa nhà** | `frontend/tenant/login.html` | `tenant2@thongnhat.vn` | `tenant123` | Cư dân Phòng 102 |
| **Cư dân tòa nhà** | `frontend/tenant/login.html` | `tenant3@thongnhat.vn` | `tenant123` | Cư dân Phòng 201 |
| **Khách hàng mới** | `frontend/public/register.html` | Tự đăng ký trực tiếp | Tự chọn (≥ 6 ký tự) | Khách hàng theo dõi lịch hẹn |

---

## 5. NGUYÊN TẮC THIẾT KẾ & GIẢI PHÁP NGHIỆP VỤ BẢO ĐẢM TOÀN VẸN CSDL

1. **Kiểm tra sức chứa tối đa của phòng (`occupant_count <= max_occupants`)**:
   Khi BQL gán người thuê mới vào phòng (`POST backend/api/admin/tenants/create.php`), hệ thống tự động kiểm tra số lượng cư dân đang thuê phòng đó. Nếu vượt quá `max_occupants`, hệ thống lập tức từ chối và thông báo lỗi.

2. **Giao dịch PDO Transaction khi xếp phòng & trả phòng**:
   - Khi gán phòng cho cư dân: Thực hiện trong `BEGIN TRANSACTION`, thêm bản ghi `tenants` và đồng thời cập nhật `rooms.status = 'rented'`. Nếu có lỗi, tự động `ROLLBACK`.
   - Khi cư dân kết thúc thuê: Cập nhật `tenants.status = 'ended'`, kiểm tra xem phòng còn người thuê khác không; nếu không còn ai thì cập nhật `rooms.status = 'available'`. Không xóa lịch sử hợp đồng cũ.

3. **Xác nhận lịch xem phòng (`bookings`) độc lập với trạng thái phòng**:
   Khi BQL bấm "Duyệt lịch hẹn" (`status = 'confirmed'`), hệ thống **không** tự ý chuyển trạng thái phòng thành `rented` vì việc xem phòng chưa cấu thành hợp đồng thuê chính thức.

4. **Tách biệt tài khoản Khách hàng (`users`) và Cư dân (`tenants`)**:
   Hai bảng hoạt động độc lập, không tự động gộp hoặc liên kết thông qua email/SĐT, bảo đảm đúng cấu trúc CSDL và tính riêng tư dữ liệu.

5. **Công thức tính tiền hóa đơn & kiểm soát công nợ ở tầng Server**:
   - Tiền điện = `(electricity_end - electricity_start) * electricity_rate`
   - Tiền nước = `(water_end - water_start) * water_rate`
   - Tổng cộng = `room_price + electricity_cost + water_cost + service_cost`
   - Nợ còn lại = `total_amount - paid_amount`
   - Chặn tuyệt đối số âm (nếu chỉ số cuối nhỏ hơn chỉ số đầu) và chặn tạo trùng lặp hóa đơn cùng một phòng trong cùng tháng/năm.

6. **Bảo mật minh chứng chuyển khoản (`storage/payment_proofs/`)**:
   Ảnh biên lai thanh toán được lưu trữ trong thư mục `storage/payment_proofs/` có tệp tin `.htaccess` chặn mọi truy cập trực tiếp từ trình duyệt (`Deny from all`). Cư dân và BQL chỉ có thể xem ảnh thông qua API trung gian `backend/api/storage/view_proof.php` sau khi xác thực quyền sở hữu hợp lệ qua PHP Session.

7. **Giới hạn cơ chế đánh dấu đã đọc (`notifications.is_read`)**:
   Trong bảng `notifications`, cột `is_read` là cờ boolean đơn thuộc từng dòng. Do đó, các thông báo chung tòa nhà (`tenant_id IS NULL`) không thể lưu trạng thái đã đọc riêng biệt cho từng người thuê mà không tạo thêm bảng liên kết phụ (vi phạm nguyên tắc không sửa CSDL). Hệ thống xử lý triệt để giới hạn này: Cư dân chỉ có thể đánh dấu đã đọc đối với các **thông báo cá nhân** (`tenant_id IS NOT NULL`).

---

## 6. BẢNG MAPPING CHI TIẾT NÚT BẤM / FORM GIỮA FRONTEND VÀ BACKEND

> Bảng thống kê toàn diện mọi phần tử tương tác trên giao diện, sự kiện bắt trong JavaScript, API Backend tiếp nhận, phương thức HTTP, tham số gửi đi, bảng CSDL bị tác động và kết quả phản hồi cập nhật UI.

### 6.1. Phân hệ Công Khai (Public Pages)

| Trang giao diện | Nút bấm / Form & ID HTML | Sự kiện | File JS & Hàm xử lý | API Backend tiếp nhận | Method | Dữ liệu gửi đi (Payload) | Bảng CSDL tác động | Kết quả & Cập nhật giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `index.html` | Tải trang | `DOMContentLoaded` | `home.js` -> `loadQuickFilterOptions()` | `api/public/rooms/filter_options.php` | `GET` | Không | `categories`, `locations` | Đổ dữ liệu loại phòng & khu vực vào bộ lọc |
| `index.html` | Tải trang | `DOMContentLoaded` | `home.js` -> `loadFeaturedRooms()` | `api/public/rooms/list.php` | `GET` | `status=available&limit=6` | `rooms`, `room_images` | Render 6 thẻ phòng nổi bật vào `#featuredRoomsContainer` |
| `index.html` | Form tìm nhanh `#quickSearchForm` | `submit` | `home.js` -> `addEventListener('submit')` | Frontend Navigation | Direct | `keyword`, `category_id`, `location_id` | Không | Chuyển hướng sang `rooms.html` kèm query params |
| `rooms.html` | Tải trang | `DOMContentLoaded` | `rooms.js` -> `loadRooms(1)` | `api/public/rooms/list.php` | `GET` | `page, limit, keyword, category_id, location_id, floor, min_price, max_price, status, sort` | `rooms`, `room_images`, `categories`, `locations` | Render lưới thẻ phòng & phân trang AJAX vào `#roomsListContainer` |
| `rooms.html` | Form lọc `#roomFilterForm` | `submit` | `rooms.js` -> `loadRooms(1)` | `api/public/rooms/list.php` | `GET` | Tiêu chí lọc tìm kiếm | `rooms` | Làm mới danh sách phòng trang 1 |
| `rooms.html` | Nút đặt lại lọc `#btnResetFilter` | `click` | `rooms.js` -> reset form | `api/public/rooms/list.php` | `GET` | Giá trị mặc định | `rooms` | Xóa bộ lọc và tải lại danh sách ban đầu |
| `rooms.html` | Select sắp xếp `#filterSort` | `change` | `rooms.js` -> `loadRooms(1)` | `api/public/rooms/list.php` | `GET` | `sort=price_asc|price_desc...` | `rooms` | Sắp xếp lại danh sách phòng |
| `rooms.html` | Nút phân trang `.page-link` | `click` | `rooms.js` -> `loadRooms(p)` | `api/public/rooms/list.php` | `GET` | `page=p` | `rooms` | Chuyển trang mượt mà không load lại trang |
| `room-detail.html`| Tải trang | `DOMContentLoaded` | `room-detail.js` -> `loadRoomDetail()` | `api/public/rooms/detail.php` | `GET` | `id=roomId` | `rooms`, `room_images`, `categories`, `locations` | Render thông số phòng, tiện nghi, mô tả và Slider ảnh |
| `room-detail.html`| Form đặt lịch `#bookingForm` | `submit` | `room-detail.js` -> Submit | `api/public/bookings/create.php` | `POST` | `room_id, customer_name, phone, email, booking_date, booking_time, note` | `bookings` (INSERT) | Hiển thị Toast thông báo thành công, reset ghi chú |
| `contact.html` | Form liên hệ `#contactForm` | `submit` | `contact.js` -> Submit | `api/public/contacts/create.php` | `POST` | `name, phone, email, subject, message` | `contact_messages` (INSERT) | Hiển thị Toast cảm ơn, làm mới ô tin nhắn |
| `login.html` | Form đăng nhập `#userLoginForm` | `submit` | `auth.js` -> Submit | `api/auth/user_login.php` | `POST` | `username, password` | `users` (SELECT) | Khởi tạo Session khách hàng, chuyển hướng sang `customer/profile.html` |
| `register.html` | Form đăng ký `#userRegisterForm`| `submit` | `auth.js` -> Submit | `api/auth/user_register.php` | `POST` | `username, fullname, email, phone, password, confirm_password` | `users` (INSERT) | Đăng ký thành công, tự động đăng nhập và vào `customer/profile.html` |

---

### 6.2. Phân hệ Khách Hàng (Customer Pages)

| Trang giao diện | Nút bấm / Form & ID HTML | Sự kiện | File JS & Hàm xử lý | API Backend tiếp nhận | Method | Dữ liệu gửi đi (Payload) | Bảng CSDL tác động | Kết quả & Cập nhật giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `profile.html` | Tải trang | `DOMContentLoaded` | `profile.js` -> `loadCustomerProfile()` | `api/customer/profile/get.php` | `GET` | Session Cookie | `users` | Điền thông tin họ tên, email, SĐT vào form |
| `profile.html` | Form hồ sơ `#userProfileForm` | `submit` | `profile.js` -> Submit | `api/customer/profile/update.php` | `POST` | `fullname, email, phone` | `users` (UPDATE) | Toast thành công, cập nhật tên hiển thị |
| `profile.html` | Form đổi pass `#userPasswordForm` | `submit` | `profile.js` -> Submit | `api/customer/profile/change_password.php`| `POST` | `current_password, new_password, confirm_password` | `users` (UPDATE password_hash) | Toast thành công, xóa trắng ô mật khẩu |
| `profile.html` | Nút đăng xuất `#btnLogoutUser` | `click` | `profile.js` -> Click | `api/auth/user_logout.php` | `POST` | Session Cookie | Hủy Session | Chuyển hướng về `public/login.html` |
| `bookings.html` | Tải trang | `DOMContentLoaded` | `bookings.js` -> `loadCustomerBookings()` | `api/customer/bookings/list.php` | `GET` | Session `user_id` | `bookings`, `rooms` | Render danh sách lịch hẹn của tôi |
| `bookings.html` | Tải trang | `DOMContentLoaded` | `bookings.js` -> `loadCustomerContacts()` | `api/customer/contacts/list.php` | `GET` | Session `user_id` | `contact_messages` | Render bảng tin nhắn liên hệ đã gửi |
| `bookings.html` | Nút tải lại `#btnReloadBookings` | `click` | `bookings.js` -> `loadCustomerBookings()` | `api/customer/bookings/list.php` | `GET` | Session `user_id` | `bookings` | Cập nhật lại trạng thái lịch hẹn mới nhất |

---

### 6.3. Phân hệ Cổng Cư Dân (Tenant Portal Pages)

| Trang giao diện | Nút bấm / Form & ID HTML | Sự kiện | File JS & Hàm xử lý | API Backend tiếp nhận | Method | Dữ liệu gửi đi (Payload) | Bảng CSDL tác động | Kết quả & Cập nhật giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `login.html` | Form đăng nhập `#tenantLoginForm` | `submit` | `auth.js` -> Submit | `api/auth/tenant_login.php` | `POST` | `email, password` | `tenants` (SELECT portal_status=1) | Khởi tạo Session cư dân, chuyển hướng sang `dashboard.html` |
| `dashboard.html` | Tải trang | `DOMContentLoaded` | `dashboard.js` -> `loadTenantDashboard()`| `api/tenant/dashboard/summary.php` | `GET` | Session `tenant_id` | `tenants`, `rooms`, `invoices`, `maintenance_requests`, `notifications` | Render tổng quan phòng, tiền cọc, cảnh báo hóa đơn nợ, báo hỏng & thông báo |
| `profile.html` | Tải trang | `DOMContentLoaded` | `profile.js` -> `loadTenantProfile()` | `api/tenant/profile/get.php` | `GET` | Session `tenant_id` | `tenants` | Điền thông tin CCCD, biển số xe, quê quán |
| `profile.html` | Form hồ sơ `#tenantProfileForm` | `submit` | `profile.js` -> Submit | `api/tenant/profile/update.php` | `POST` | `fullname, phone, hometown, license_plate, avatar (file)` | `tenants` (UPDATE) | Lưu avatar vào `uploads/avatars/`, Toast thành công |
| `profile.html` | Form đổi pass `#tenantPasswordForm` | `submit` | `profile.js` -> Submit | `api/tenant/profile/change_password.php`| `POST` | `current_password, new_password` | `tenants` (UPDATE portal_password) | Toast thành công, reset form mật khẩu |
| `contract.html` | Tải trang | `DOMContentLoaded` | `contract.js` -> `loadContractInfo()` | `api/tenant/contract/get.php` | `GET` | Session `tenant_id` | `tenants`, `rooms` | Hiển thị hợp đồng, tiền cọc, biên bản bàn giao |
| `contract.html` | Form gia hạn `#extensionRequestForm` | `submit` | `contract.js` -> Submit | `api/tenant/contract/request_extension.php` | `POST` | `extension_status, extension_note` | `tenants` (UPDATE) | Toast thành công, hiển thị hộp trạng thái chờ duyệt |
| `invoices.html` | Tải trang | `DOMContentLoaded` | `invoices.js` -> `loadTenantInvoices()` | `api/tenant/invoices/list.php` | `GET` | Session `tenant_id` | `invoices`, `rooms` | Render bảng lịch sử hóa đơn hàng tháng |
| `invoices.html` | Nút xem chi tiết `.btn-view-invoice` | `click` | `invoices.js` -> Click | `api/tenant/invoices/detail.php` | `GET` | `id=invoiceId` | `invoices`, `rooms` | Mở Modal `#invoiceDetailModal` bóc tách chỉ số điện nước |
| `invoices.html` | Nút nộp bill `.btn-upload-proof` | `click` | `invoices.js` -> Click | Frontend UI | Direct | Đọc data-id | Không | Mở Modal `#uploadProofModal` điền mã hóa đơn |
| `invoices.html` | Form nộp bill `#uploadProofForm` | `submit` | `invoices.js` -> Submit | `api/tenant/invoices/upload_proof.php` | `POST` | `id, payment_proof (file)` | `invoices` (UPDATE payment_proof_status='pending') | Lưu ảnh vào `storage/payment_proofs/`, Toast thành công, làm mới bảng |
| `maintenance.html` | Tải trang | `DOMContentLoaded` | `maintenance.js` -> `loadTenantMaintenance()` | `api/tenant/maintenance/list.php` | `GET` | Session `tenant_id` | `maintenance_requests` | Render bảng danh sách phiếu báo hỏng |
| `maintenance.html` | Nút mở modal `#btnOpenMaintenanceModal` | `click` | `maintenance.js` -> Click | Frontend UI | Direct | Reset form | Không | Mở Modal `#maintenanceModal` |
| `maintenance.html` | Form báo hỏng `#maintenanceForm` | `submit` | `maintenance.js` -> Submit | `api/tenant/maintenance/create.php` | `POST` | `title, description` | `maintenance_requests` (INSERT) | Toast thành công, đóng modal, tải lại bảng |
| `notifications.html` | Tải trang | `DOMContentLoaded` | `notifications.js` -> `loadTenantNotifications()` | `api/tenant/notifications/list.php` | `GET` | Session `tenant_id` | `notifications` | Render danh sách thông báo chung và riêng |
| `notifications.html` | Nút đã đọc `.btn-mark-read` | `click` | `notifications.js` -> Click | `api/tenant/notifications/mark_read.php` | `POST` | `id=notificationId` | `notifications` (UPDATE is_read=1) | Toast thành công, đổi huy hiệu thành "Đã đọc" |

---

### 6.4. Phân hệ Quản Trị Viên (Admin Pages)

| Trang giao diện | Nút bấm / Form & ID HTML | Sự kiện | File JS & Hàm xử lý | API Backend tiếp nhận | Method | Dữ liệu gửi đi (Payload) | Bảng CSDL tác động | Kết quả & Cập nhật giao diện |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `login.html` | Form login `#adminLoginForm` | `submit` | `auth.js` -> Submit | `api/auth/admin_login.php` | `POST` | `username, password` | `admins` (UPDATE last_login) | Tạo Session admin, chuyển hướng sang `dashboard.html` |
| `dashboard.html` | Tải trang | `DOMContentLoaded` | `dashboard.js` -> `loadDashboardStats()`| `api/admin/dashboard/stats.php` | `GET` | Session Admin | `rooms, tenants, invoices, bookings, maintenance_requests` | Render 4 thẻ thống kê, biểu đồ tài chính & bảng việc cần làm |
| `rooms.html` | Tải danh sách | `DOMContentLoaded` | `rooms.js` -> `loadRooms(1)` | `api/admin/rooms/list.php` | `GET` | `page, limit, keyword, category_id, location_id, status` | `rooms, categories, locations` | Render bảng phòng, số người ở hiện tại / tối đa |
| `rooms.html` | Form lọc `#roomFilterForm` | `submit` | `rooms.js` -> `loadRooms(1)` | `api/admin/rooms/list.php` | `GET` | Tiêu chí lọc | `rooms` | Cập nhật bảng theo điều kiện tìm kiếm |
| `rooms.html` | Nút thêm phòng `#btnAddRoom` | `click` | `rooms.js` -> Click | Frontend UI | Direct | Reset form | Không | Mở Modal `#roomModal` ở chế độ Thêm mới |
| `rooms.html` | Nút sửa phòng `.btn-edit-room` | `click` | `rooms.js` -> Click | `api/admin/rooms/detail.php` | `GET` | `id=roomId` | `rooms` | Điền thông tin vào Modal `#roomModal` để sửa |
| `rooms.html` | Form lưu phòng `#roomForm` | `submit` | `rooms.js` -> Submit | `api/admin/rooms/create.php` hoặc `update.php` | `POST` | `room_number, category_id, location_id, floor, price, area, max_occupants, electricity_rate, water_rate, status, description, amenities, image` | `rooms` (INSERT / UPDATE) | Upload ảnh đại diện, lưu CSDL, đóng Modal, tải lại bảng |
| `rooms.html` | Nút xóa phòng `.btn-delete-room`| `click` | `rooms.js` -> Click | `api/admin/rooms/delete.php` | `POST` | `id=roomId` | `rooms` (DELETE) | Kiểm tra ràng buộc hợp đồng đang thuê, xóa và tải lại bảng |
| `rooms.html` | Nút quản lý ảnh `.btn-images-room`| `click` | `rooms.js` -> Click | `api/admin/rooms/detail.php` | `GET` | `id=roomId` | `room_images` | Mở Modal `#imagesModal` hiển thị album ảnh |
| `rooms.html` | Form thêm ảnh `#uploadImageForm` | `submit` | `rooms.js` -> Submit | `api/admin/rooms/upload_image.php` | `POST` | `room_id, image (file)` | `room_images` (INSERT) | Lưu ảnh vào `uploads/rooms/`, cập nhật danh sách ảnh |
| `rooms.html` | Nút xóa ảnh `.btn-delete-img` | `click` | `rooms.js` -> Click | `api/admin/rooms/delete_image.php` | `POST` | `id=imageId` | `room_images` (DELETE) | Xóa file vật lý & bản ghi, cập nhật album |
| `categories.html` | Form lưu loại `#categoryForm` | `submit` | `categories.js` -> Submit | `api/admin/categories/create.php` hoặc `update.php` | `POST` | `name, description` | `categories` (INSERT / UPDATE) | Toast thành công, đóng modal, tải lại bảng |
| `categories.html` | Nút xóa loại `.btn-delete-cat` | `click` | `categories.js` -> Click | `api/admin/categories/delete.php` | `POST` | `id=catId` | `categories` (DELETE) | Kiểm tra phòng thuộc loại trước khi xóa |
| `locations.html` | Form lưu khu vực `#locationForm` | `submit` | `locations.js` -> Submit | `api/admin/locations/create.php` hoặc `update.php` | `POST` | `name, address, description` | `locations` (INSERT / UPDATE) | Toast thành công, đóng modal, tải lại bảng |
| `locations.html` | Nút xóa khu vực `.btn-delete-loc`| `click` | `locations.js` -> Click | `api/admin/locations/delete.php` | `POST` | `id=locId` | `locations` (DELETE) | Kiểm tra phòng thuộc khu vực trước khi xóa |
| `tenants.html` | Form lưu người thuê `#tenantForm`| `submit` | `tenants.js` -> Submit | `api/admin/tenants/create.php` hoặc `update.php` | `POST` | `room_id, fullname, email, phone, id_card, hometown, license_plate, deposit_amount, start_date, end_date, contract_notes` | `tenants, rooms` (TRANSACTION) | Kiểm tra sức chứa, cập nhật `rooms.status='rented'`, Toast thành công |
| `tenants.html` | Nút trả phòng `.btn-end-contract`| `click` | `tenants.js` -> Click | `api/admin/tenants/end_contract.php` | `POST` | `id=tenantId` | `tenants, rooms` (TRANSACTION) | Cập nhật `tenants.status='ended'`, trả phòng thành `available` nếu hết người |
| `tenants.html` | Nút duyệt gia hạn `.btn-process-extension` | `click` | `tenants.js` -> Click | `api/admin/tenants/process_extension.php` | `POST` | `id=tenantId, action=accept|reject, new_end_date` | `tenants` (UPDATE) | Xử lý yêu cầu gia hạn/trả phòng của cư dân |
| `tenants.html` | Nút bật/tắt portal `.btn-toggle-portal` | `click` | `tenants.js` -> Click | `api/admin/tenants/toggle_portal.php` | `POST` | `id=tenantId` | `tenants` (UPDATE portal_status) | Kích hoạt hoặc khóa quyền truy cập Cổng Cư Dân |
| `tenants.html` | Nút reset pass `.btn-reset-password` | `click` | `tenants.js` -> Click | `api/admin/tenants/reset_password.php` | `POST` | `id=tenantId, new_password` | `tenants` (UPDATE portal_password) | Đặt lại mật khẩu mặc định mới cho cư dân |
| `invoices.html` | Form lập hóa đơn `#invoiceForm` | `submit` | `invoices.js` -> Submit | `api/admin/invoices/create.php` | `POST` | `tenant_id, month, year, electricity_start, electricity_end, water_start, water_end, service_cost, other_cost` | `invoices` (INSERT) | Tự động tính tiền điện, nước, tổng tiền, chặn trùng kỳ |
| `invoices.html` | Form thu tiền `#paymentForm` | `submit` | `invoices.js` -> Submit | `api/admin/invoices/record_payment.php` | `POST` | `id, payment_amount` | `invoices` (UPDATE paid_amount, status) | Thu tiền mặt/chuyển khoản, tính lại công nợ |
| `invoices.html` | Form duyệt bill `#reviewProofForm`| `submit` | `invoices.js` -> Submit | `api/admin/invoices/review_proof.php` | `POST` | `id, action=approved|rejected, confirmed_amount, admin_notes` | `invoices` (UPDATE payment_proof_status) | Xác nhận số tiền thực nhận vào tài khoản, cập nhật trạng thái hóa đơn |
| `invoices.html` | Nút xóa hóa đơn `.btn-delete-invoice` | `click` | `invoices.js` -> Click | `api/admin/invoices/delete.php` | `POST` | `id=invoiceId` | `invoices` (DELETE) | Chặn xóa hóa đơn đã thanh toán đầy đủ |
| `bookings.html` | Nút duyệt/hủy lịch `.btn-update-booking` | `click` | `bookings.js` -> Click | `api/admin/bookings/update_status.php` | `POST` | `id, status=confirmed|completed|cancelled` | `bookings` (UPDATE) | Cập nhật trạng thái lịch hẹn xem phòng |
| `bookings.html` | Nút xóa lịch `.btn-delete-booking` | `click` | `bookings.js` -> Click | `api/admin/bookings/delete.php` | `POST` | `id=bookingId` | `bookings` (DELETE) | Xóa lịch hẹn xem phòng khỏi hệ thống |
| `contacts.html` | Nút trạng thái `.btn-update-contact` | `click` | `contacts.js` -> Click | `api/admin/contacts/update_status.php` | `POST` | `id, status=replied|closed` | `contact_messages` (UPDATE) | Đánh dấu đã liên hệ phản hồi cho khách |
| `contacts.html` | Nút xóa liên hệ `.btn-delete-contact` | `click` | `contacts.js` -> Click | `api/admin/contacts/delete.php` | `POST` | `id=contactId` | `contact_messages` (DELETE) | Xóa tin nhắn liên hệ |
| `maintenance.html`| Form xử lý sửa `#processModal` | `submit` | `maintenance.js` -> Submit | `api/admin/maintenance/update.php` | `POST` | `id, status, admin_notes, cost` | `maintenance_requests` (UPDATE) | Cập nhật tiến độ xử lý và chi phí sửa chữa |
| `notifications.html`| Form phát thông báo `#notificationForm`| `submit` | `notifications.js` -> Submit | `api/admin/notifications/create.php` | `POST` | `target_type (all/single), tenant_id, title, message` | `notifications` (INSERT) | Phát thông báo chung hoặc gửi đích danh cư dân |
| `notifications.html`| Nút xóa TB `.btn-delete-notif` | `click` | `notifications.js` -> Click | `api/admin/notifications/delete.php` | `POST` | `id=notifId` | `notifications` (DELETE) | Gỡ bỏ thông báo |
| `accounts.html` | Form lưu admin `#accountForm` | `submit` | `accounts.js` -> Submit | `api/admin/accounts/create.php` hoặc `update.php` | `POST` | `username, fullname, email, phone, role, password` | `admins` (INSERT / UPDATE) | Superadmin phân quyền quản trị viên mới |
| `accounts.html` | Nút xóa admin `.btn-delete-account`| `click` | `accounts.js` -> Click | `api/admin/accounts/delete.php` | `POST` | `id=adminId` | `admins` (DELETE) | Chặn tự xóa tài khoản của chính mình |

---

## 7. BẢO MẬT & XÁC THỰC TOÀN HỆ THỐNG

1. **CSRF Protection**:
   Mọi yêu cầu gửi dữ liệu thay đổi (`POST`, `PUT`, `DELETE`) từ Frontend đều được đính kèm tiêu đề HTTP `X-CSRF-Token` hoặc trường `csrf_token` trong form. Phía backend kiểm tra token hợp lệ trước khi thực thi truy vấn.
2. **Prepared Statements**:
   Tất cả các câu lệnh SQL trong toàn bộ 11 repositories đều sử dụng PDO Prepared Statements với tham số ràng buộc (`$stmt->execute([':param' => $val])`), ngăn chặn tuyệt đối lỗi SQL Injection.
3. **Mã hóa mật khẩu chuẩn Bcrypt**:
   Mật khẩu cho quản trị viên (`admins`), người dùng (`users`) và cư dân (`tenants`) đều được băm bằng thuật toán `password_hash($password, PASSWORD_BCRYPT)` chuẩn của PHP.
4. **Kiểm tra Session Ownership**:
   Khi cư dân hoặc khách hàng gọi các API xem hóa đơn, hợp đồng, sửa chữa hoặc thông báo, backend trích xuất `tenant_id` hoặc `user_id` trực tiếp từ `$_SESSION`, không tin tưởng bất kỳ ID nào do client gửi lên.
5. **Kiểm tra MIME Type & Chặn tệp tin độc hại**:
   Tất cả các luồng tải tệp ảnh lên (ảnh phòng, ảnh đại diện, minh chứng thanh toán) đều được kiểm tra bằng PHP `finfo` (File Information), kiểm tra phần mở rộng tệp (`jpg`, `jpeg`, `png`, `webp`) và đổi tên tệp ngẫu nhiên bằng chuỗi hash an toàn trước khi lưu trữ vào đĩa.

---
*Tác giả: Antigravity AI Coding Assistant - Hệ thống Quản Lý Nhà Trọ & Căn Hộ Mini (PHP Thuần & PDO)*

