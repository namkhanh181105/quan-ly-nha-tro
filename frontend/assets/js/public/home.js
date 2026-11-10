/**
 * ==============================================================================
 * JAVASCRIPT TRANG CHỦ WEBSITE (PUBLIC HOMEPAGE)
 * ==============================================================================
 * File: frontend/assets/js/public/home.js
 * Nhiệm vụ:
 * 1. Tải danh mục & khu vực đổ vào bộ lọc nhanh #quickSearchForm:
 *    - Gọi GET backend/api/public/rooms/filter_options.php
 * 2. Xử lý tìm kiếm nhanh trên Hero Banner:
 *    - Bắt sự kiện submit form #quickSearchForm
 *    - Thu thập keyword, category_id, location_id
 *    - Chuyển hướng sang rooms.html kèm query params
 * 3. Tải danh sách phòng nổi bật mới nhất:
 *    - Gọi GET backend/api/public/rooms/list.php?status=available&limit=6
 *    - Render cards vào #featuredRoomsContainer
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // ============================================================================
  // HÀM 1: NẠP DỮ LIỆU BỘ LỌC TÌM KIẾM NHANH (CATEGORY & LOCATION)
  // ============================================================================
  /**
   * Tên hàm: loadQuickFilterOptions
   * Giao diện gọi: Chạy tự động khi tải trang chủ
   * API Backend: GET backend/api/public/rooms/filter_options.php
   * Trả về: { success: true, data: { categories: [...], locations: [...] } }
   * Cập nhật UI: Đổ các thẻ <option> vào #quickCategory và #quickLocation
   */
  async function loadQuickFilterOptions() {
    try {
      const res = await API.get('/public/rooms/filter_options.php');
      if (res.success && res.data) {
        const catSelect = document.getElementById('quickCategory');
        const locSelect = document.getElementById('quickLocation');

        if (catSelect && res.data.categories) {
          res.data.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = `${cat.name} (${cat.room_count || 0})`;
            catSelect.appendChild(opt);
          });
        }

        if (locSelect && res.data.locations) {
          res.data.locations.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc.id;
            opt.textContent = `${loc.name} (${loc.room_count || 0})`;
            locSelect.appendChild(opt);
          });
        }
      }
    } catch (err) {
      console.warn('Không thể tải dữ liệu bộ lọc nhanh:', err);
    }
  }

  // ============================================================================
  // SỰ KIỆN FORM: SUBMIT #quickSearchForm (TÌM KIẾM NHANH)
  // ============================================================================
  /**
   * Bắt sự kiện submit #quickSearchForm
   * Luồng:
   * 1. Thu thập giá trị từ input #quickKeyword, select #quickCategory, #quickLocation.
   * 2. Tạo URLSearchParams.
   * 3. Chuyển hướng người dùng sang trang rooms.html?keyword=...&category_id=...
   * Thao tác xử lý hoàn toàn trên frontend navigation, không gọi API trực tiếp.
   */
  const quickSearchForm = document.getElementById('quickSearchForm');
  if (quickSearchForm) {
    quickSearchForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const keyword = document.getElementById('quickKeyword').value.trim();
      const categoryId = document.getElementById('quickCategory').value;
      const locationId = document.getElementById('quickLocation').value;

      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (categoryId) params.append('category_id', categoryId);
      if (locationId) params.append('location_id', locationId);

      window.location.href = `rooms.html?${params.toString()}`;
    });
  }

  // ============================================================================
  // HÀM 2: TẢI DANH SÁCH PHÒNG NỔI BẬT TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadFeaturedRooms
   * Giao diện gọi: Khi trang tải xong
   * API Backend: GET backend/api/public/rooms/list.php?status=available&limit=6
   * Trả về: { success: true, data: { rooms: [...], pagination: {...} } }
   * Cập nhật UI: Đổ HTML các card phòng vào #featuredRoomsContainer
   */
  async function loadFeaturedRooms() {
    const container = document.getElementById('featuredRoomsContainer');
    if (!container) return;

    try {
      const res = await API.get('/public/rooms/list.php', {
        status: 'available',
        limit: 6,
        sort: 'created_desc'
      });

      const rooms = (res.data && (res.data.items || res.data.rooms)) || (Array.isArray(res.data) ? res.data : []);
      if (res.success && rooms.length > 0) {
        renderFeaturedRooms(rooms);
      } else {
        container.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-info-circle fs-3 d-block mb-2 text-secondary"></i>
            Hiện tại chưa có phòng mới cập nhật hoặc đã kín phòng.
          </div>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải phòng nổi bật:', err);
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          <i class="bi bi-x-circle fs-3 d-block mb-2"></i>
          ${err.message || 'Đã có lỗi xảy ra khi kết nối máy chủ.'}
        </div>
      `;
    }
  }

  // ============================================================================
  // HÀM 3: RENDER THẺ PHÒNG TRÊN GIAO DIỆN
  // ============================================================================
  function renderFeaturedRooms(rooms) {
    const container = document.getElementById('featuredRoomsContainer');
    if (!rooms || rooms.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-muted">
          Hiện chưa có phòng trống sẵn sàng vào ở. Vui lòng quay lại sau!
        </div>
      `;
      return;
    }

    container.innerHTML = rooms.map(room => {
      // Xác định ảnh đại diện phòng
      const defaultImg = `${APP_CONFIG.BASE_URL}/frontend/assets/images/default-room.jpg`;
      const imgVal = room.image_url || room.image || '';
      let thumbUrl = defaultImg;
      if (imgVal) {
        if (imgVal.startsWith('http://') || imgVal.startsWith('https://')) {
          thumbUrl = imgVal;
        } else if (imgVal.startsWith('uploads/')) {
          thumbUrl = `${APP_CONFIG.BASE_URL}/${imgVal}`;
        } else {
          thumbUrl = `${APP_CONFIG.BASE_URL}/uploads/rooms/${imgVal}`;
        }
      }

      // Xử lý tiện nghi cơ bản
      let amenitiesList = [];
      if (room.amenities) {
        amenitiesList = room.amenities.split(',').map(a => a.trim()).filter(Boolean).slice(0, 3);
      }

      const amenitiesBadges = amenitiesList.map(a => `
        <span class="badge bg-light text-secondary border small fw-normal">
          <i class="bi bi-check2 me-1 text-success"></i>${Utils.escapeHtml(a)}
        </span>
      `).join(' ');

      return `
        <div class="col-lg-4 col-md-6">
          <div class="card h-100 room-card border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            <!-- ẢNH ĐẠI DIỆN PHÒNG & BADGE -->
            <div class="room-thumbnail-wrapper position-relative">
              <img src="${thumbUrl}" class="card-img-top room-card-img" alt="${Utils.escapeHtml(room.room_number)}"
                   onerror="this.onerror=null; this.src='${defaultImg}'">
              
              <div class="position-absolute top-0 start-0 m-3">
                <span class="badge bg-success shadow-sm px-3 py-2 fw-semibold">
                  <i class="bi bi-door-open me-1"></i> Sẵn sàng ở
                </span>
              </div>
              
              <div class="position-absolute bottom-0 end-0 m-3">
                <span class="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill fw-bold">
                  ${Utils.formatCurrency(room.price)}/tháng
                </span>
              </div>
            </div>

            <!-- NỘI DUNG PHÒNG -->
            <div class="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge bg-primary-subtle text-primary small fw-semibold">
                    <i class="bi bi-building me-1"></i>Tầng ${room.floor}
                  </span>
                  <span class="small text-muted">
                    <i class="bi bi-geo-alt me-1"></i>${Utils.escapeHtml(room.location_name || 'Hà Nội')}
                  </span>
                </div>

                <h5 class="card-title fw-bold text-dark mt-2 mb-2">
                  <a href="room-detail.html?id=${room.id}" class="text-decoration-none text-dark hover-primary">
                    Phòng ${Utils.escapeHtml(room.room_number)} - ${Utils.escapeHtml(room.category_name || 'Phòng Trọ')}
                  </a>
                </h5>

                <p class="text-muted small mb-3">
                  <i class="bi bi-arrows-fullscreen me-1 text-primary"></i>${room.area} m² 
                  <span class="mx-2">•</span> 
                  <i class="bi bi-people me-1 text-primary"></i>Tối đa ${room.max_occupants} người
                </p>

                <!-- TIỆN NGHI TIÊU BIỂU -->
                <div class="d-flex flex-wrap gap-1 mb-3">
                  ${amenitiesBadges}
                </div>
              </div>

              <!-- NÚT CHI TIẾT & ĐẶT LỊCH HẸN -->
              <div class="pt-3 border-top d-flex gap-2">
                <!-- NÚT: Xem chi tiết phòng (Chuyển trang room-detail.html?id=...) -->
                <a href="room-detail.html?id=${room.id}" class="btn btn-outline-primary btn-sm flex-fill fw-semibold">
                  Xem chi tiết
                </a>
                <!-- NÚT: Đặt lịch xem phòng nhanh (Mở trang chi tiết với hash #booking) -->
                <a href="room-detail.html?id=${room.id}#booking" class="btn btn-primary btn-sm flex-fill fw-semibold">
                  <i class="bi bi-calendar-check me-1"></i> Đặt lịch hẹn
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Khởi chạy nạp dữ liệu ban đầu
  loadQuickFilterOptions();
  loadFeaturedRooms();
});

