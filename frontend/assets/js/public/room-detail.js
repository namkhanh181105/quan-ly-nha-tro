/**
 * ==============================================================================
 * JAVASCRIPT CHI TIẾT PHÒNG & ĐẶT LỊCH XEM PHÒNG (PUBLIC ROOM DETAIL)
 * ==============================================================================
 * File: frontend/assets/js/public/room-detail.js
 * Nhiệm vụ:
 * 1. Lấy room_id từ tham số query URL (room-detail.html?id=...).
 * 2. Gọi GET backend/api/public/rooms/detail.php?id=... để tải thông tin chi tiết phòng & album ảnh.
 * 3. Render Carousel và album ảnh thu nhỏ, các thông số kỹ thuật, tiện ích và mô tả phòng.
 * 4. Tự động điền thông tin người dùng nếu khách hàng đã đăng nhập (kiểm tra qua GET backend/api/auth/user_me.php).
 * 5. Bắt sự kiện submit form đặt lịch hẹn #bookingForm:
 *    - Gửi POST backend/api/public/bookings/create.php
 *    - Nhận phản hồi JSON: nếu thành công hiển thị Toast và reset form.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id');

  if (!roomId) {
    alert('Không tìm thấy mã phòng hợp lệ!');
    window.location.href = 'rooms.html';
    return;
  }

  // Gán ID phòng vào hidden input của form đặt lịch
  document.getElementById('bookingRoomId').value = roomId;

  // Giới hạn ngày đặt lịch: từ hôm nay trở đi
  const today = new Date().toISOString().split('T')[0];
  const bookingDateInput = document.getElementById('bookingDate');
  if (bookingDateInput) {
    bookingDateInput.min = today;
    bookingDateInput.value = today;
  }

  // ============================================================================
  // HÀM 1: KIỂM TRA PHIÊN KHÁCH HÀNG ĐĂNG NHẬP (TỰ ĐỘNG ĐIỀN THÔNG TIN FORM)
  // ============================================================================
  /**
   * Tên hàm: checkLoggedInCustomer
   * Mục đích: Tiện ích trải nghiệm người dùng, nếu đã đăng nhập thì tự điền tên, số điện thoại, email
   * API: GET backend/api/auth/user_me.php
   */
  async function checkLoggedInCustomer() {
    try {
      const res = await API.get('backend/api/auth/user_me.php');
      if (res.success && res.data) {
        const u = res.data;
        if (u.fullname) document.getElementById('bookingCustomerName').value = u.fullname;
        if (u.phone) document.getElementById('bookingPhone').value = u.phone;
        if (u.email) document.getElementById('bookingEmail').value = u.email;
      }
    } catch (e) {
      // Bỏ qua nếu chưa đăng nhập
    }
  }

  // ============================================================================
  // HÀM 2: TẢI CHI TIẾT PHÒNG TỪ BACKEND
  // ============================================================================
  /**
   * Tên hàm: loadRoomDetail
   * Giao diện gọi: Chạy ngay khi mở trang
   * API Backend: GET backend/api/public/rooms/detail.php?id=...
   * Trả về: { success: true, data: { room: {...}, images: [...] } }
   * Cập nhật UI: Đổ dữ liệu vào các thẻ hiển thị trên giao diện
   */
  async function loadRoomDetail() {
    try {
      const res = await API.get('backend/api/public/rooms/detail.php', { id: roomId });

      if (res.success && res.data) {
        const room = res.data.room || res.data;
        const images = res.data.images || [];

        renderRoomInfo(room);
        renderRoomGallery(room, images);
      } else {
        alert(res.message || 'Không tìm thấy thông tin phòng này!');
        window.location.href = 'rooms.html';
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phòng:', err);
      alert('Không thể kết nối đến máy chủ để tải thông tin phòng.');
    }
  }

  // ============================================================================
  // HÀM 3: RENDER THÔNG TIN CHI TIẾT PHÒNG
  // ============================================================================
  function renderRoomInfo(room) {
    document.title = `Phòng ${room.room_number} - ${room.category_name || 'Phòng Trọ'} | CCMN`;

    // Breadcrumb & tiêu đề
    document.getElementById('breadcrumbRoomName').textContent = `Phòng ${room.room_number}`;
    document.getElementById('detailRoomTitle').textContent = `Phòng ${room.room_number} - ${room.category_name || 'Căn Hộ Mini'}`;
    document.getElementById('detailLocationText').textContent = `${room.location_name || ''} - ${room.address || 'Hà Nội'}`;
    document.getElementById('detailPriceBadge').textContent = `${Utils.formatCurrency(room.price)} / tháng`;

    // Thông số kỹ thuật
    document.getElementById('detailArea').textContent = `${room.area} m²`;
    document.getElementById('detailMaxOccupants').textContent = `${room.max_occupants} người`;
    document.getElementById('detailFloor').textContent = `Tầng ${room.floor}`;
    document.getElementById('detailElectricityRate').textContent = `${Utils.formatCurrency(room.electricity_rate)} / kWh`;
    document.getElementById('detailWaterRate').textContent = `${Utils.formatCurrency(room.water_rate)} / m³`;

    // Trạng thái phòng
    const statusEl = document.getElementById('detailStatus');
    if (room.status === 'available') {
      statusEl.innerHTML = '<span class="badge bg-success">Còn trống (Sẵn sàng ở)</span>';
    } else if (room.status === 'rented') {
      statusEl.innerHTML = '<span class="badge bg-secondary">Đang cho thuê</span>';
    } else {
      statusEl.innerHTML = '<span class="badge bg-warning text-dark">Đang bảo trì</span>';
    }

    // Tiện nghi phòng
    const amenitiesContainer = document.getElementById('detailAmenitiesContainer');
    if (room.amenities) {
      const list = room.amenities.split(',').map(a => a.trim()).filter(Boolean);
      amenitiesContainer.innerHTML = list.map(item => `
        <span class="badge bg-light text-dark border p-2 px-3 fw-normal fs-6">
          <i class="bi bi-check-circle-fill text-success me-2"></i>${Utils.escapeHtml(item)}
        </span>
      `).join('');
    } else {
      amenitiesContainer.innerHTML = '<span class="text-muted small">Chưa có thông tin tiện nghi cụ thể.</span>';
    }

    // Mô tả phòng (cho phép hiển thị ngắt dòng hoặc HTML an toàn)
    const descEl = document.getElementById('detailDescription');
    if (room.description) {
      descEl.innerHTML = room.description.replace(/\n/g, '<br>');
    } else {
      descEl.innerHTML = '<p class="text-muted italic">Chưa có mô tả chi tiết cho căn phòng này.</p>';
    }
  }

  // ============================================================================
  // HÀM 4: RENDER BỘ SƯU TẬP ẢNH (SLIDER & THUMBNAILS)
  // ============================================================================
  function renderRoomGallery(room, images) {
    const indicators = document.getElementById('carouselIndicators');
    const inner = document.getElementById('carouselInner');
    const thumbsContainer = document.getElementById('roomThumbnailsContainer');

    // Gom toàn bộ ảnh (bao gồm ảnh đại diện room.image_url và mảng images)
    const defaultImg = `${APP_CONFIG.BASE_URL}/frontend/assets/images/default-room.jpg`;
    let allImages = [];
    if (images && images.length > 0) {
      allImages = images.map(img => img.image_url);
    } else if (room.image_url || room.image) {
      allImages = [room.image_url || room.image];
    } else {
      allImages = ['frontend/assets/images/default-room.jpg'];
    }

    const resolveImgUrl = (img) => {
      if (!img || img === 'default-room.jpg' || img === 'default-room.svg') return defaultImg;
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (img.startsWith('uploads/')) return `${APP_CONFIG.BASE_URL}/${img}`;
      return `${APP_CONFIG.BASE_URL}/uploads/rooms/${img}`;
    };

    // Render indicators
    indicators.innerHTML = allImages.map((_, idx) => `
      <button type="button" data-bs-target="#roomCarousel" data-bs-slide-to="${idx}" 
              class="${idx === 0 ? 'active' : ''}" aria-label="Slide ${idx + 1}"></button>
    `).join('');

    // Render Carousel Items
    inner.innerHTML = allImages.map((imgUrl, idx) => {
      const fullUrl = resolveImgUrl(imgUrl);
      return `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${fullUrl}" class="d-block w-100 object-fit-contain" style="max-height: 480px; height: 480px;" 
               alt="Ảnh phòng ${room.room_number}" onerror="this.onerror=null; this.src='${defaultImg}'">
        </div>
      `;
    }).join('');

    // Render Thumbnails
    thumbsContainer.innerHTML = allImages.map((imgUrl, idx) => {
      const fullUrl = resolveImgUrl(imgUrl);
      return `
        <img src="${fullUrl}" class="img-thumbnail rounded-3 pointer" style="width: 80px; height: 60px; object-fit: cover;"
             data-bs-target="#roomCarousel" data-bs-slide-to="${idx}" alt="Thumb ${idx + 1}"
             onerror="this.onerror=null; this.src='${defaultImg}'">
      `;
    }).join('');
  }

  // ============================================================================
  // SỰ KIỆN FORM: SUBMIT #bookingForm (GỬI YÊU CẦU ĐẶT LỊCH XEM PHÒNG)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #bookingForm
   * Luồng hoạt động:
   * 1. Kiểm tra ngày giờ đặt lịch phải hợp lệ (không được trong quá khứ).
   * 2. Thu thập payload: room_id, customer_name, phone, email, booking_date, booking_time, note.
   * 3. Gọi POST backend/api/public/bookings/create.php.
   * 4. Nhận JSON từ backend:
   *    - Nếu success == true: hiển thị Toast thành công, reset form (giữ lại họ tên nếu đã đăng nhập).
   *    - Nếu success == false: hiển thị Toast lỗi từ backend.
   */
  document.getElementById('bookingForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.getElementById('btnSubmitBooking');
    const originalBtnHtml = submitBtn.innerHTML;

    const payload = {
      room_id: document.getElementById('bookingRoomId').value,
      customer_name: document.getElementById('bookingCustomerName').value.trim(),
      customer_phone: document.getElementById('bookingPhone').value.trim(),
      customer_email: document.getElementById('bookingEmail').value.trim(),
      appointment_date: document.getElementById('bookingDate').value,
      phone: document.getElementById('bookingPhone').value.trim(),
      email: document.getElementById('bookingEmail').value.trim(),
      booking_date: document.getElementById('bookingDate').value,
      booking_time: document.getElementById('bookingTime').value,
      note: document.getElementById('bookingNote').value.trim()
    };

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang gửi yêu cầu...';

      const res = await API.post('backend/api/public/bookings/create.php', payload);

      if (res.success) {
        Utils.showToast(
          res.message || 'Đặt lịch hẹn xem phòng thành công! Ban quản lý sẽ sớm liên hệ xác nhận với bạn qua số điện thoại.',
          'success'
        );
        // Reset ghi chú và ngày
        document.getElementById('bookingNote').value = '';
      } else {
        Utils.showToast(res.message || 'Không thể gửi lịch hẹn. Vui lòng thử lại.', 'danger');
      }
    } catch (err) {
      console.error('Lỗi khi gửi đặt lịch:', err);
      Utils.showToast('Lỗi máy chủ khi gửi thông tin lịch hẹn. Vui lòng liên hệ hotline.', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });

  // Khởi chạy
  await checkLoggedInCustomer();
  await loadRoomDetail();
});

