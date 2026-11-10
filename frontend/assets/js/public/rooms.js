/**
 * ==============================================================================
 * JAVASCRIPT DANH SÁCH & TÌM KIẾM PHÒNG TRỌ (PUBLIC ROOMS LISTING)
 * ==============================================================================
 * File: frontend/assets/js/public/rooms.js
 * Nhiệm vụ:
 * 1. Đọc tham số URL ban đầu (keyword, category_id, location_id) nếu có từ trang chủ.
 * 2. Gọi GET backend/api/public/rooms/filter_options.php để nạp các option danh mục & khu vực.
 * 3. Bắt sự kiện submit form lọc #roomFilterForm:
 *    - Gom các tiêu chí: keyword, category_id, location_id, floor, min_price, max_price, status, sort.
 *    - Gọi GET backend/api/public/rooms/list.php bằng Fetch API.
 *    - Cập nhật giao diện: lưới thẻ phòng (#roomsListContainer) & phân trang (#roomsPagination).
 * 4. Bắt sự kiện đổi sắp xếp #filterSort (change event) => Tự động tải lại trang 1.
 * 5. Bắt sự kiện nút đặt lại bộ lọc #btnResetFilter => Reset form về ban đầu và tải lại.
 * 6. Bắt sự kiện bấm nút phân trang => Gọi loadRooms(page) mượt mà không reload trang.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  let currentPage = 1;
  const limitPerPage = 9;

  // ============================================================================
  // HÀM 1: ĐỌC URL QUERY PARAMS & NẠP FILTER OPTIONS BAN ĐẦU
  // ============================================================================
  /**
   * Đọc các tham số được truyền từ trang chủ qua URL (ví dụ: rooms.html?keyword=studio&category_id=2)
   */
  const urlParams = new URLSearchParams(window.location.search);
  const initialKeyword = urlParams.get('keyword') || '';
  const initialCategoryId = urlParams.get('category_id') || '';
  const initialLocationId = urlParams.get('location_id') || '';

  if (initialKeyword) {
    document.getElementById('filterKeyword').value = initialKeyword;
  }

  // ============================================================================
  // HÀM 2: TẢI DANH MỤC & KHU VỰC VÀO SELECT BỘ LỌC
  // ============================================================================
  /**
   * Tên hàm: loadFilterOptions
   * Giao diện gọi: Chạy khi mở trang rooms.html
   * API Backend: GET backend/api/public/rooms/filter_options.php
   * Trả về: { success: true, data: { categories: [...], locations: [...] } }
   * Cập nhật UI: Đổ các thẻ <option> vào #filterCategory và #filterLocation
   */
  async function loadFilterOptions() {
    try {
      const res = await API.get('/public/rooms/filter_options.php');
      if (res.success && res.data) {
        const catSelect = document.getElementById('filterCategory');
        const locSelect = document.getElementById('filterLocation');

        if (catSelect && res.data.categories) {
          res.data.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = `${cat.name} (${cat.room_count || 0})`;
            if (initialCategoryId && initialCategoryId == cat.id) opt.selected = true;
            catSelect.appendChild(opt);
          });
        }

        if (locSelect && res.data.locations) {
          res.data.locations.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc.id;
            opt.textContent = `${loc.name} (${loc.room_count || 0})`;
            if (initialLocationId && initialLocationId == loc.id) opt.selected = true;
            locSelect.appendChild(opt);
          });
        }
      }
    } catch (err) {
      console.warn('Lỗi khi tải danh sách bộ lọc:', err);
    }
  }

  // ============================================================================
  // HÀM 3: GỌI API BACKEND TẢI DANH SÁCH PHÒNG
  // ============================================================================
  /**
   * Tên hàm: loadRooms
   * Giao diện gọi: Khi trang sẵn sàng, khi bấm Lọc (#btnApplyFilter), khi đổi sắp xếp hoặc khi bấm phân trang
   * API Backend: GET backend/api/public/rooms/list.php
   * Query params: page, limit, keyword, category_id, location_id, floor, min_price, max_price, status, sort
   * Trả về: { success: true, data: { rooms: [...], pagination: { total, page, total_pages, limit } } }
   * Cập nhật UI:
   * - Hiển thị số lượng phòng tìm thấy tại #totalRoomsCount
   * - Render thẻ phòng vào #roomsListContainer
   * - Render phân trang vào #roomsPagination
   */
  async function loadRooms(page = 1) {
    currentPage = page;
    const container = document.getElementById('roomsListContainer');
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Đang tìm phòng theo tiêu chí...</p>
      </div>
    `;

    // Thu thập tham số lọc
    const params = {
      page: currentPage,
      limit: limitPerPage,
      keyword: document.getElementById('filterKeyword').value.trim(),
      category_id: document.getElementById('filterCategory').value,
      location_id: document.getElementById('filterLocation').value,
      floor: document.getElementById('filterFloor').value,
      min_price: document.getElementById('filterMinPrice').value,
      max_price: document.getElementById('filterMaxPrice').value,
      status: document.getElementById('filterStatus').value,
      sort: document.getElementById('filterSort').value
    };

    try {
      const res = await API.get('/public/rooms/list.php', params);

      if (res.success && res.data) {
        const rooms = res.data.items || res.data.rooms || (Array.isArray(res.data) ? res.data : []);
        const pag = res.data.pagination || { total: rooms.length, page: 1, total_pages: 1 };

        // Cập nhật số lượng tổng cộng
        const totalCountBadge = document.getElementById('totalRoomsCount');
        if (totalCountBadge) {
          totalCountBadge.textContent = `${pag.total} phòng khả dụng`;
        }

        const summaryText = document.getElementById('filterSummaryText');
        if (summaryText) {
          summaryText.innerHTML = `Tìm thấy <strong>${pag.total}</strong> phòng trọ phù hợp (Trang ${pag.page}/${pag.total_pages || 1})`;
        }

        renderRoomsList(rooms);
        renderPagination(pag);
      } else {
        container.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="bi bi-search fs-2 d-block mb-2 text-secondary"></i>
            ${res.message || 'Không tìm thấy phòng trọ nào phù hợp với bộ lọc hiện tại.'}
          </div>
        `;
        document.getElementById('roomsPagination').innerHTML = '';
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách phòng:', err);
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          <i class="bi bi-x-circle fs-2 d-block mb-2"></i>
          Đã có lỗi xảy ra khi tải dữ liệu từ máy chủ.
        </div>
      `;
    }
  }

  // ============================================================================
  // HÀM 4: RENDER DANH SÁCH THẺ PHÒNG
  // ============================================================================
  function renderRoomsList(rooms) {
    const container = document.getElementById('roomsListContainer');
    if (!rooms || rooms.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-muted bg-white rounded-4 shadow-sm">
          <i class="bi bi-emoji-neutral fs-2 d-block mb-2 text-warning"></i>
          Không tìm thấy phòng nào phù hợp với tiêu chí lọc của bạn.<br>
          Hãy thử xóa bớt bộ lọc hoặc chọn khoảng giá khác.
        </div>
      `;
      return;
    }

    container.innerHTML = rooms.map(room => {
      // Xác định ảnh hiển thị
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

      // Huy hiệu trạng thái
      let statusBadge = '<span class="badge bg-success shadow-sm px-2 py-1"><i class="bi bi-door-open me-1"></i>Còn trống</span>';
      if (room.status === 'rented') {
        statusBadge = '<span class="badge bg-secondary shadow-sm px-2 py-1"><i class="bi bi-lock me-1"></i>Đã thuê</span>';
      } else if (room.status === 'maintenance') {
        statusBadge = '<span class="badge bg-warning text-dark shadow-sm px-2 py-1"><i class="bi bi-wrench me-1"></i>Bảo trì</span>';
      }

      // Xử lý tiện ích (cắt ngắn 3 mục đầu tiên)
      let amenitiesBadges = '';
      if (room.amenities) {
        const list = room.amenities.split(',').map(a => a.trim()).filter(Boolean).slice(0, 3);
        amenitiesBadges = list.map(a => `
          <span class="badge bg-light text-secondary border small fw-normal">
            <i class="bi bi-check2 me-1 text-success"></i>${Utils.escapeHtml(a)}
          </span>
        `).join(' ');
      }

      return `
        <div class="col-md-6 col-xl-4">
          <div class="card h-100 room-card border-0 shadow-sm rounded-4 overflow-hidden position-relative">
            <!-- ẢNH ĐẠI DIỆN -->
            <div class="room-thumbnail-wrapper position-relative">
              <img src="${thumbUrl}" class="card-img-top room-card-img" alt="${Utils.escapeHtml(room.room_number)}"
                   onerror="this.onerror=null; this.src='${defaultImg}'">
              
              <div class="position-absolute top-0 start-0 m-2">
                ${statusBadge}
              </div>
              
              <div class="position-absolute bottom-0 end-0 m-2">
                <span class="badge bg-dark bg-opacity-75 text-white px-2 py-1 rounded-pill fw-bold">
                  ${Utils.formatCurrency(room.price)}/tháng
                </span>
              </div>
            </div>

            <!-- NỘI DUNG THẺ -->
            <div class="card-body p-3 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="badge bg-primary-subtle text-primary small fw-semibold">
                    <i class="bi bi-building me-1"></i>Tầng ${room.floor}
                  </span>
                  <span class="small text-muted text-truncate" style="max-width: 140px;">
                    <i class="bi bi-geo-alt me-1"></i>${Utils.escapeHtml(room.location_name || 'Hà Nội')}
                  </span>
                </div>

                <h6 class="card-title fw-bold text-dark mt-2 mb-1">
                  <a href="room-detail.html?id=${room.id}" class="text-decoration-none text-dark hover-primary">
                    Phòng ${Utils.escapeHtml(room.room_number)} - ${Utils.escapeHtml(room.category_name || 'Phòng Trọ')}
                  </a>
                </h6>

                <div class="text-muted small mb-2">
                  <i class="bi bi-arrows-fullscreen me-1 text-primary"></i>${room.area} m² 
                  <span class="mx-1">•</span> 
                  <i class="bi bi-people me-1 text-primary"></i>Tối đa ${room.max_occupants} người
                </div>

                <div class="d-flex flex-wrap gap-1 mb-3">
                  ${amenitiesBadges}
                </div>
              </div>

              <!-- THAO TÁC -->
              <div class="pt-2 border-top d-flex gap-2">
                <!-- NÚT: Xem chi tiết phòng (Chuyển trang room-detail.html?id=...) -->
                <a href="room-detail.html?id=${room.id}" class="btn btn-outline-primary btn-sm flex-fill fw-semibold">
                  Chi tiết
                </a>
                <!-- NÚT: Đặt lịch xem phòng (Chuyển trang room-detail.html?id=...#booking) -->
                <a href="room-detail.html?id=${room.id}#booking" class="btn btn-primary btn-sm flex-fill fw-semibold">
                  <i class="bi bi-calendar2-check me-1"></i> Đặt lịch
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================================================
  // HÀM 5: RENDER THANH PHÂN TRANG AJAX
  // ============================================================================
  function renderPagination(pagination) {
    const ul = document.getElementById('roomsPagination');
    if (!ul) return;

    if (pagination.total_pages <= 1) {
      ul.innerHTML = '';
      return;
    }

    let html = '';

    // Nút Trang trước
    const prevDisabled = pagination.page <= 1 ? 'disabled' : '';
    html += `
      <li class="page-item ${prevDisabled}">
        <a class="page-link" href="#" data-page="${pagination.page - 1}" aria-label="Previous">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;

    // Các số trang
    for (let p = 1; p <= pagination.total_pages; p++) {
      if (p === 1 || p === pagination.total_pages || (p >= pagination.page - 2 && p <= pagination.page + 2)) {
        const active = p === pagination.page ? 'active' : '';
        html += `
          <li class="page-item ${active}">
            <a class="page-link" href="#" data-page="${p}">${p}</a>
          </li>
        `;
      } else if (p === pagination.page - 3 || p === pagination.page + 3) {
        html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    // Nút Trang sau
    const nextDisabled = pagination.page >= pagination.total_pages ? 'disabled' : '';
    html += `
      <li class="page-item ${nextDisabled}">
        <a class="page-link" href="#" data-page="${pagination.page + 1}" aria-label="Next">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;

    ul.innerHTML = html;
  }

  // ============================================================================
  // SỰ KIỆN: BẤM NÚT PHÂN TRANG (PAGINATION CLICK)
  // ============================================================================
  document.getElementById('roomsPagination').addEventListener('click', function (e) {
    e.preventDefault();
    const link = e.target.closest('.page-link');
    if (!link || link.parentElement.classList.contains('disabled') || link.parentElement.classList.contains('active')) return;

    const page = parseInt(link.getAttribute('data-page'));
    if (page && page > 0) {
      loadRooms(page);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  });

  // ============================================================================
  // SỰ KIỆN FORM: SUBMIT #roomFilterForm (ÁP DỤNG BỘ LỌC)
  // ============================================================================
  document.getElementById('roomFilterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    loadRooms(1);
  });

  // ============================================================================
  // SỰ KIỆN SELECT: THAY ĐỔI SẮP XẾP #filterSort
  // ============================================================================
  document.getElementById('filterSort').addEventListener('change', function () {
    loadRooms(1);
  });

  // ============================================================================
  // SỰ KIỆN NÚT: ĐẶT LẠI BỘ LỌC #btnResetFilter
  // ============================================================================
  document.getElementById('btnResetFilter').addEventListener('click', function () {
    document.getElementById('roomFilterForm').reset();
    document.getElementById('filterStatus').value = 'available';
    document.getElementById('filterSort').value = 'created_desc';
    loadRooms(1);
  });

  // Khởi chạy
  await loadFilterOptions();
  loadRooms(1);
});

