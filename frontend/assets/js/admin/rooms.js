/**
 * ============================================================================
 * JAVASCRIPT XỬ LÝ TRANG QUẢN LÝ PHÒNG TRỌ (ADMIN ROOMS JS)
 * ============================================================================
 * Kết nối chặt chẽ giữa giao diện frontend/admin/rooms.html và API Backend:
 * - Xem danh sách & phân trang: GET backend/api/admin/rooms/list.php
 * - Lọc & tìm kiếm: GET backend/api/admin/rooms/list.php với query params
 * - Xem chi tiết để sửa/ảnh: GET backend/api/admin/rooms/detail.php
 * - Thêm phòng: POST backend/api/admin/rooms/create.php (FormData)
 * - Sửa phòng: POST backend/api/admin/rooms/update.php (FormData)
 * - Xóa phòng: POST backend/api/admin/rooms/delete.php (JSON, chặn nếu có lịch sử)
 * - Bộ sưu tập ảnh: upload_image.php & delete_image.php
 */

let currentPage = 1;
let currentFilters = {};
let roomModalInstance = null;
let galleryModalInstance = null;
let deleteModalInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Nạp các thành phần dùng chung: Sidebar và Header Admin
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');
  
  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Quản Lý Phòng Trọ';

  // 2. Khởi tạo đối tượng Bootstrap Modal
  roomModalInstance = new bootstrap.Modal(document.getElementById('roomModal'));
  galleryModalInstance = new bootstrap.Modal(document.getElementById('roomGalleryModal'));
  deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteRoomConfirmModal'));

  // 3. Nạp danh mục loại phòng và khu vực vào các ô select
  await loadFilterOptions();

  // 4. Nạp danh sách phòng ban đầu (Trang 1)
  await loadRooms(1);

  // 5. Gắn sự kiện các nút và form
  initEventListeners();
});

/**
 * ============================================================================
 * A. HÀM TẢI DANH MỤC VÀ KHU VỰC ĐỔ VÀO DROPDOWN
 * ============================================================================
 * Nguồn API: GET backend/api/public/rooms/filter_options.php
 */
async function loadFilterOptions() {
  try {
    const res = await API.get('/public/rooms/filter_options.php');
    if (res && res.success && res.data) {
      const { categories, locations } = res.data;

      // Đổ vào dropdown lọc
      const filterCat = document.getElementById('filterCategory');
      if (filterCat) {
        categories.forEach(c => {
          filterCat.innerHTML += `<option value="${c.id}">${CONFIG.escapeHtml(c.name)}</option>`;
        });
      }

      // Đổ vào dropdown trong Modal Thêm/Sửa
      const formCat = document.getElementById('roomCategoryId');
      if (formCat) {
        formCat.innerHTML = '<option value="">-- Chọn loại phòng --</option>';
        categories.forEach(c => {
          formCat.innerHTML += `<option value="${c.id}">${CONFIG.escapeHtml(c.name)}</option>`;
        });
      }

      const formLoc = document.getElementById('roomLocationId');
      if (formLoc) {
        formLoc.innerHTML = '<option value="">-- Chọn khu vực --</option>';
        locations.forEach(l => {
          formLoc.innerHTML += `<option value="${l.id}">${CONFIG.escapeHtml(l.name)} (${CONFIG.escapeHtml(l.city)})</option>`;
        });
      }
    }
  } catch (e) {
    console.error('Lỗi nạp danh mục/khu vực:', e);
  }
}

/**
 * ============================================================================
 * B. HÀM LẤY DANH SÁCH PHÒNG TRỌ (LOAD ROOMS)
 * ============================================================================
 * Bắt nguồn từ: Sự kiện tải trang hoặc khi bấm Lọc / Phân trang
 * Gọi API: GET backend/api/admin/rooms/list.php?keyword=...&category_id=...&page=...
 * Nhận kết quả: JSON danh sách phòng + Phân trang và render bảng #roomsTableBody
 */
async function loadRooms(page = 1) {
  currentPage = page;
  const tbody = document.getElementById('roomsTableBody');
  tbody.innerHTML = `
    <tr>
      <td colspan="10" class="text-center py-4 text-muted">
        <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Đang tải dữ liệu phòng trọ...
      </td>
    </tr>
  `;

  try {
    const params = {
      page: currentPage,
      limit: 10,
      ...currentFilters
    };

    const res = await API.get('/admin/rooms/list.php', params);
    if (res && res.success && res.data) {
      const { items, pagination } = res.data;
      renderRoomsTable(items);
      renderPagination(pagination);
    } else {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-danger">${res.message || 'Không thể tải danh sách phòng.'}</td></tr>`;
    }
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-danger">Lỗi kết nối máy chủ khi tải danh sách phòng.</td></tr>`;
  }
}

/**
 * Render các dòng dữ liệu vào bảng HTML
 */
function renderRoomsTable(rooms) {
  const tbody = document.getElementById('roomsTableBody');
  if (!rooms || rooms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">Không tìm thấy phòng trọ nào khớp với điều kiện lọc.</td></tr>`;
    return;
  }

  let html = '';
  rooms.forEach(r => {
    // Đường dẫn ảnh đại diện phòng
    const imgUrl = (r.image && r.image !== 'default-room.jpg')
      ? CONFIG.UPLOADS_URL + '/rooms/' + encodeURIComponent(r.image)
      : '../assets/images/default-room.jpg';

    html += `
      <tr>
        <td>
          <img src="${imgUrl}" alt="Phòng ${r.room_number}" class="rounded border" width="55" height="42" style="object-fit: cover;" onerror="this.src='../assets/images/default-room.jpg'">
        </td>
        <td>
          <span class="badge bg-dark fw-bold fs-6">P.${CONFIG.escapeHtml(r.room_number)}</span>
        </td>
        <td>
          <div class="fw-bold text-dark">${CONFIG.escapeHtml(r.title)}</div>
          <small class="text-muted"><i class="bi bi-tag me-1"></i>${CONFIG.escapeHtml(r.category_name || 'Chưa phân loại')}</small>
        </td>
        <td><span class="badge bg-light text-dark border">Tầng ${r.floor}</span></td>
        <td><strong>${r.area}</strong> m²</td>
        <td><span class="price-tag">${CONFIG.formatCurrency(r.price)}</span></td>
        <td class="small text-muted">
          <div><i class="bi bi-lightning-charge text-warning"></i> ${CONFIG.formatCurrency(r.electricity_price)}/số</div>
          <div><i class="bi bi-droplet text-info"></i> ${CONFIG.formatCurrency(r.water_price)}/khối</div>
        </td>
        <td><i class="bi bi-person me-1"></i>Tối đa ${r.max_occupants || 2} người</td>
        <td>${CONFIG.getStatusBadge('room', r.status)}</td>
        <td class="text-center">
          <div class="btn-group btn-group-sm" role="group">
            <!-- Nút sửa phòng: data-id="${r.id}" -->
            <button class="btn btn-outline-primary btn-edit-room" data-id="${r.id}" title="Sửa thông tin">
              <i class="bi bi-pencil-square"></i>
            </button>
            <!-- Nút xóa phòng: data-id="${r.id}" data-number="${r.room_number}" -->
            <button class="btn btn-outline-danger btn-delete-room" data-id="${r.id}" data-number="${CONFIG.escapeHtml(r.room_number)}" title="Xóa phòng">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Gắn sự kiện cho các nút hành động trên bảng
  bindTableActionButtons();
}

/**
 * Gắn sự kiện cho các nút Sửa, Xóa và Bộ sưu tập ảnh sau khi render bảng
 * lắng nghe sự kiện
 */
function bindTableActionButtons() {
  // Nút Sửa: Lấy ID và gọi hàm openEditModal(id)
  document.querySelectorAll('.btn-edit-room').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openEditModal(id); //gọi hàm modal sửa phòng
    });
  });

  // Nút Xóa: Mở modal xác nhận xóa
  document.querySelectorAll('.btn-delete-room').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const number = btn.getAttribute('data-number');
      openDeleteConfirmModal(id, number); /// Mở modal xác nhận xóa phòng
    });
  });


}

/**
 * Render thanh phân trang
 */
function renderPagination(pagination) {
  const infoEl = document.getElementById('paginationInfo');
  const listEl = document.getElementById('paginationList');
  if (!pagination) return;

  const { page, total, total_pages, limit } = pagination;
  infoEl.textContent = `Hiển thị trang ${page} / ${total_pages || 1} (Tổng cộng ${total} phòng trọ)`;

  if (total_pages <= 1) {
    listEl.innerHTML = '';
    return;
  }

  let html = '';
  // Nút Trang trước
  html += `
    <li class="page-item ${page <= 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page - 1}">&laquo;</a>
    </li>
  `;

  for (let i = 1; i <= total_pages; i++) {
    html += `
      <li class="page-item ${i === page ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Nút Trang sau
  html += `
    <li class="page-item ${page >= total_pages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${page + 1}">&raquo;</a>
    </li>
  `;

  listEl.innerHTML = html;

  listEl.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const p = parseInt(link.getAttribute('data-page'));
      if (p && p !== currentPage && p >= 1 && p <= total_pages) {
        loadRooms(p);
      }
    });
  });
}

/**
 * ============================================================================
 * C. KHỞI TẠO CÁC SỰ KIỆN NÚT VÀ BIỂU MẪU
 * ============================================================================
 */
function initEventListeners() {
  // 1. Form tìm kiếm & Lọc (#roomFilterForm)
  const filterForm = document.getElementById('roomFilterForm');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      currentFilters = {
        keyword: document.getElementById('filterKeyword').value.trim(),
        category_id: document.getElementById('filterCategory').value,
        floor: document.getElementById('filterFloor').value,
        status: document.getElementById('filterStatus').value
      };
      loadRooms(1);
    });
  }

  // 2. Nút đặt lại bộ lọc (#btnResetFilter)
  const btnReset = document.getElementById('btnResetFilter');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.getElementById('roomFilterForm').reset();
      currentFilters = {};
      loadRooms(1);
    });
  }

  // 3. Nút mở modal thêm phòng mới (#btnAddRoom)
  // Xử lý hoàn toàn tại Frontend: reset form, đổi tiêu đề modal, mở modal. Chưa gọi API.
  const btnAdd = document.getElementById('btnAddRoom');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      openCreateModal();
    });
  }

  // 4. Submit form lưu phòng (#roomForm) Bắt sự kiện submit form
  const roomForm = document.getElementById('roomForm');
  if (roomForm) {
    roomForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSaveRoomSubmit(); // Gọi hàm xử lý đóng gói và gửi dữ liệu 
    });
  }

  // 5. Nút xác nhận xóa phòng trong modal (#btnConfirmDeleteRoom)
  const btnConfirmDelete = document.getElementById('btnConfirmDeleteRoom');
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      await handleConfirmDeleteRoom();
    });
  }

  // 6. Form tải ảnh bộ sưu tập (#uploadGalleryForm)
  const uploadGalleryForm = document.getElementById('uploadGalleryForm');
  if (uploadGalleryForm) {
    uploadGalleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleUploadGalleryImage();
    });
  }
}

/**
 * ============================================================================
 * D. MỞ MODAL THÊM PHÒNG MỚI (CREATE ROOM MODAL)
 * ============================================================================
 * Thao tác Frontend: Không gọi API, chỉ reset form và hiển thị modal.
 */
function openCreateModal() {
  const form = document.getElementById('roomForm');
  form.reset();
  document.getElementById('roomId').value = '';
  document.getElementById('roomModalTitle').textContent = 'Thêm phòng trọ mới';
  document.getElementById('currentImageHelp').textContent = 'Tải lên ảnh chụp thực tế đại diện cho phòng (JPG, PNG, WEBP).';
  document.getElementById('roomAddress').value = 'Số 18, Ngõ 86 Cầu Giấy, Hà Nội';
  document.getElementById('roomElectricityPrice').value = '3800';
  document.getElementById('roomWaterPrice').value = '30000';
  document.getElementById('roomMaxOccupants').value = '2';
  roomModalInstance.show();
}

/**
 * ============================================================================
 * E. MỞ MODAL SỬA PHÒNG (EDIT ROOM MODAL)
 * ============================================================================
 * Bước 1: Gọi API GET backend/api/admin/rooms/detail.php?id={id}
 * Bước 2: Điền dữ liệu nhận được vào các ô input của form #roomForm
 * Bước 3: Đổi tiêu đề modal và mở modal #roomModal
 * Hàm gọi API.get('api/admin/rooms/detail.php', { id: roomId }) sử dụng Fetch API để gửi yêu cầu GET 
 */
async function openEditModal(roomId) {
  try {
    API.showLoading();
    const res = await API.get('/admin/rooms/detail.php', { id: roomId });
    if (res && res.success && res.data && res.data.room) {
      const r = res.data.room;
//// Đổ dữ liệu từ Database vào các ô nhập liệu tương ứng trên form modal có thể sửa ô cần thay đổi (303-310)
      document.getElementById('roomId').value = r.id;
      document.getElementById('roomTitle').value = r.title;
      document.getElementById('roomNumber').value = r.room_number;
      document.getElementById('roomFloor').value = r.floor;
      document.getElementById('roomCategoryId').value = r.category_id;
      document.getElementById('roomLocationId').value = r.location_id;
      document.getElementById('roomAddress').value = r.address;
      document.getElementById('roomPrice').value = r.price;
      document.getElementById('roomArea').value = r.area;
      document.getElementById('roomElectricityPrice').value = r.electricity_price;
      document.getElementById('roomWaterPrice').value = r.water_price;
      document.getElementById('roomMaxOccupants').value = r.max_occupants || 2;
      document.getElementById('roomStatus').value = r.status;
      document.getElementById('roomAmenities').value = r.amenities || '';
      document.getElementById('roomDescription').value = r.description || '';
      document.getElementById('currentImageHelp').innerHTML = `Ảnh hiện tại: <strong>${CONFIG.escapeHtml(r.image)}</strong>. Chọn ảnh mới nếu muốn thay đổi.`;
// Hiển thị tên file ảnh hiện tại bên dưới ô chọn ảnh
      document.getElementById('roomModalTitle').textContent = `Cập nhật phòng trọ P.${r.room_number}`;
      roomModalInstance.show();
    } else {
      CONFIG.showToast(res.message || 'Không tìm thấy thông tin phòng.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi lấy thông tin chi tiết phòng.', 'error');
  } finally {
    API.hideLoading();
  }
}

/**
 * ============================================================================
 * F. XỬ LÝ LƯU PHÒNG (SUBMIT FORM THÊM HOẶC SỬA)
 * ============================================================================
 * Nút kích hoạt: #btnSaveRoom
 * Dữ liệu gửi: FormData chứa thông tin phòng + File ảnh đại diện
 * API Backend:
 * - Nếu roomId rỗng: POST backend/api/admin/rooms/create.php
 * - Nếu có roomId:   POST backend/api/admin/rooms/update.php
 * Kết quả:
 * - Thành công: Đóng modal, hiện toast success, reload danh sách giữ nguyên bộ lọc
 * - Thất bại: Giữ nguyên form, hiển thị thông báo lỗi
 * Đóng gói và gửi qua Fetch API
 */
async function handleSaveRoomSubmit() {
  const form = document.getElementById('roomForm');
  const btnSave = document.getElementById('btnSaveRoom');
  const roomId = document.getElementById('roomId').value;
  const isEdit = Boolean(roomId);
  // Phân luồng endpoint: có roomId thì gọi api/admin/rooms/update.php, ngược lại gọi create.php
  const formData = new FormData(form);
  const endpoint = isEdit ? '/admin/rooms/update.php' : '/admin/rooms/create.php';

  try {
    const res = await API.post(endpoint, formData, { buttonToDisable: btnSave });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Lưu phòng trọ thành công!', 'success');
      roomModalInstance.hide();
      // Tải lại danh sách theo bộ lọc hiện tại
      await loadRooms(currentPage);
    } else {
      CONFIG.showToast(res.message || 'Không thể lưu phòng trọ. Vui lòng kiểm tra lại.', 'error');
    }
  } catch (error) {
    CONFIG.showToast('Lỗi kết nối khi lưu thông tin phòng.', 'error');
  }
}

/**
 * ============================================================================
 * G. XỬ LÝ XÓA PHÒNG TRỌ (DELETE ROOM FLOW)
 * ============================================================================
 * Bước 1: Mở modal xác nhận xóa
 * Bước 2: Khi người dùng bấm #btnConfirmDeleteRoom -> Gọi POST backend/api/admin/rooms/delete.php
 * Nghiệp vụ Backend: Chặn xóa phòng nếu có lịch sử hợp đồng hoặc hóa đơn.
 */
function openDeleteConfirmModal(roomId, roomNumber) {
  document.getElementById('deleteRoomId').value = roomId;
  document.getElementById('deleteRoomNumberDisplay').textContent = `P.${roomNumber}`; //hiển thị số phong trong modal xác nhận xóa
  deleteModalInstance.show();  //hiển thị modal cảnh báo đỏ sau khi bấm nút xóa (446-)
}

async function handleConfirmDeleteRoom() {
  const roomId = document.getElementById('deleteRoomId').value;
  const btnConfirm = document.getElementById('btnConfirmDeleteRoom');
 // Gửi request POST ngầm kèm ID phòng và vô hiệu hóa nút trong lúc chờ (backend/api/..)
  try {
    const res = await API.post('/admin/rooms/delete.php', { id: roomId }, { buttonToDisable: btnConfirm });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Đã xóa phòng trọ thành công.', 'success');
      deleteModalInstance.hide();
      await loadRooms(currentPage);
    } else {
      // Backend chặn xóa do có dữ liệu ràng buộc lịch sử nghiệp vụ
      CONFIG.showToast(res.message || 'Không thể xóa phòng này.', 'warning');
      deleteModalInstance.hide();
    }
  } catch (error) {
    CONFIG.showToast('Lỗi kết nối khi xóa phòng trọ.', 'error');
  }
}

/**
 * ============================================================================
 * H. BỘ SƯU TẬP ẢNH PHÒNG TRỌ (ROOM GALLERY FLOW)
 * ============================================================================
 * - Nạp danh sách ảnh: GET backend/api/admin/rooms/detail.php?id={id}
 * - Tải thêm ảnh: POST backend/api/admin/rooms/upload_image.php
 * - Xóa ảnh: POST backend/api/admin/rooms/delete_image.php
 */
async function openGalleryModal(roomId, roomNumber) {
  document.getElementById('galleryRoomId').value = roomId;
  document.getElementById('galleryModalTitle').textContent = `Bộ sưu tập ảnh phòng P.${roomNumber}`;
  document.getElementById('uploadGalleryForm').reset();
  await loadGalleryImages(roomId);
  galleryModalInstance.show();
}

async function loadGalleryImages(roomId) {
  const container = document.getElementById('galleryImagesList');
  container.innerHTML = '<div class="col-12 text-center py-3 text-muted">Đang tải bộ sưu tập ảnh...</div>';

  try {
    const res = await API.get('/admin/rooms/detail.php', { id: roomId });
    if (res && res.success && res.data) {
      const images = res.data.images || [];
      if (images.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-3 text-muted">Chưa có ảnh phụ nào trong bộ sưu tập của phòng này.</div>';
        return;
      }

      let html = '';
      images.forEach(img => {
        const fullImgUrl = CONFIG.UPLOADS_URL + '/rooms/' + encodeURIComponent(img.image_url);
        html += `
          <div class="col-md-4 col-sm-6">
            <div class="card h-100 border shadow-sm">
              <img src="${fullImgUrl}" class="card-img-top" style="height: 140px; object-fit: cover;" alt="${CONFIG.escapeHtml(img.caption || '')}" onerror="this.src='../assets/images/default-room.jpg'">
              <div class="card-body p-2 d-flex justify-content-between align-items-center">
                <small class="text-truncate text-muted me-2" title="${CONFIG.escapeHtml(img.caption || '')}">${CONFIG.escapeHtml(img.caption || 'Ảnh phòng')}</small>
                <!-- Nút xóa ảnh trong bộ sưu tập: data-img-id="${img.id}" -->
                <button type="button" class="btn btn-outline-danger btn-sm p-1 btn-delete-gallery-img" data-img-id="${img.id}" title="Xóa ảnh này">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;

      // Gắn sự kiện xóa ảnh
      container.querySelectorAll('.btn-delete-gallery-img').forEach(btn => {
        btn.addEventListener('click', async () => {
          const imgId = btn.getAttribute('data-img-id');
          if (confirm('Bạn có chắc muốn xóa ảnh này khỏi bộ sưu tập?')) {
            await handleDeleteGalleryImage(imgId, roomId);
          }
        });
      });
    }
  } catch (e) {
    container.innerHTML = '<div class="col-12 text-center py-3 text-danger">Lỗi khi tải ảnh bộ sưu tập.</div>';
  }
}

async function handleUploadGalleryImage() {
  const roomId = document.getElementById('galleryRoomId').value;
  const fileInput = document.getElementById('galleryImageInput');
  const captionInput = document.getElementById('galleryCaptionInput');
  const btnUpload = document.getElementById('btnUploadGalleryImage');

  if (!fileInput.files || fileInput.files.length === 0) {
    CONFIG.showToast('Vui lòng chọn ảnh cần tải lên.', 'warning');
    return;
  }

  const formData = new FormData();
  formData.append('room_id', roomId);
  formData.append('gallery_image', fileInput.files[0]);
  formData.append('caption', captionInput.value.trim());

  try {
    const res = await API.post('/admin/rooms/upload_image.php', formData, { buttonToDisable: btnUpload });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Tải ảnh lên thành công!', 'success');
      document.getElementById('uploadGalleryForm').reset();
      await loadGalleryImages(roomId);
    } else {
      CONFIG.showToast(res.message || 'Không thể tải ảnh.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi tải ảnh.', 'error');
  }
}

async function handleDeleteGalleryImage(imageId, roomId) {
  try {
    const res = await API.post('/admin/rooms/delete_image.php', { image_id: imageId });
    if (res && res.success) {
      CONFIG.showToast('Đã xóa ảnh thành công.', 'success');
      await loadGalleryImages(roomId);
    } else {
      CONFIG.showToast(res.message || 'Không thể xóa ảnh.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi xóa ảnh.', 'error');
  }
}

