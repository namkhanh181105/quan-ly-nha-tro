/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ KHU VỰC (ADMIN LOCATIONS JS)
 * ============================================================================
 * - Nạp danh sách: GET backend/api/admin/locations/list.php
 * - Xem chi tiết: GET backend/api/admin/locations/detail.php
 * - Thêm mới: POST backend/api/admin/locations/create.php
 * - Cập nhật: POST backend/api/admin/locations/update.php
 * - Xóa: POST backend/api/admin/locations/delete.php (Chặn nếu có phòng liên kết)
 */

let locationModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Quản Lý Khu Vực';

  locationModal = new bootstrap.Modal(document.getElementById('locationModal'));
  await loadLocations();

  document.getElementById('btnAddLocation').addEventListener('click', () => {
    document.getElementById('locationForm').reset();
    document.getElementById('locationId').value = '';
    document.getElementById('locationCity').value = 'Hà Nội';
    document.getElementById('locationModalTitle').textContent = 'Thêm khu vực mới';
    locationModal.show();
  });

  document.getElementById('locationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveLocation();
  });
});

async function loadLocations() {
  const tbody = document.getElementById('locationsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải...</td></tr>';

  try {
    const res = await API.get('/admin/locations/list.php');
    if (res && res.success && res.data) {
      const items = res.data;
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Chưa có khu vực nào.</td></tr>';
        return;
      }

      let html = '';
      items.forEach(l => {
        html += `
          <tr>
            <td><span class="text-muted fw-bold">#${l.id}</span></td>
            <td><strong>${CONFIG.escapeHtml(l.name)}</strong></td>
            <td><code>${CONFIG.escapeHtml(l.slug)}</code></td>
            <td>${CONFIG.escapeHtml(l.city || 'Hà Nội')}</td>
            <td><span class="badge bg-primary-subtle text-primary border">${l.room_count || 0} phòng</span></td>
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-edit-loc" data-id="${l.id}" title="Sửa"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-outline-danger btn-delete-loc" data-id="${l.id}" data-name="${CONFIG.escapeHtml(l.name)}" title="Xóa"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
// Bấm SỬA -> gọi hàm openEditLocation(id) bắt sự kiện click nút sửa
      tbody.querySelectorAll('.btn-edit-loc').forEach(b => {
        b.addEventListener('click', () => openEditLocation(b.getAttribute('data-id')));
      });
      // Bấm XÓA -> gọi hàm handleDeleteLocation(id, name)
      tbody.querySelectorAll('.btn-delete-loc').forEach(b => {
        b.addEventListener('click', () => handleDeleteLocation(b.getAttribute('data-id'), b.getAttribute('data-name')));
      });
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Lỗi khi tải danh sách khu vực.</td></tr>';
  }
}
//Gửi Request GET lấy dữ liệu chi tiết
async function openEditLocation(id) {
  try {
    API.showLoading();
    const res = await API.get('/admin/locations/detail.php', { id });
    if (res && res.success && res.data) {
      const l = res.data;
      //: Đổ dữ liệu vào từng ô input của Modal và mở Modal => 105
      document.getElementById('locationId').value = l.id;
      document.getElementById('locationName').value = l.name;
      document.getElementById('locationSlug').value = l.slug;
      document.getElementById('locationCity').value = l.city || 'Hà Nội';
      document.getElementById('locationModalTitle').textContent = `Sửa khu vực #${l.id}`;
      locationModal.show();
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi lấy thông tin khu vực.', 'error');
  } finally {
    API.hideLoading();
  }
}
//lấy toàn bộ dữ liệu vừa chỉnh sửa trong form:
async function handleSaveLocation() {
  const btnSave = document.getElementById('btnSaveLocation');
  const id = document.getElementById('locationId').value;
  const isEdit = Boolean(id);

  const payload = {
    id: id ? parseInt(id) : undefined,
    name: document.getElementById('locationName').value.trim(),
    slug: document.getElementById('locationSlug').value.trim(),
    city: document.getElementById('locationCity').value.trim()
  };
//// Phân luồng: Nếu là sửa -> gọi update.php, nếu là thêm mới -> gọi create.php Gửi Request POST cập nhật
  const endpoint = isEdit ? '/admin/locations/update.php' : '/admin/locations/create.php';

  try {
    const res = await API.post(endpoint, payload, { buttonToDisable: btnSave });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Lưu thành công!', 'success');
      locationModal.hide();
      await loadLocations();
    } else {
      CONFIG.showToast(res.message || 'Lỗi khi lưu khu vực.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi lưu khu vực.', 'error');
  }
}

async function handleDeleteLocation(id, name) {
  if (!confirm(`Bạn có chắc chắn muốn xóa khu vực "${name}"?`)) return;

  try {
    const res = await API.post('/admin/locations/delete.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Xóa khu vực thành công.', 'success');
      await loadLocations();
    } else {
      CONFIG.showToast(res.message || 'Không thể xóa khu vực này.', 'warning');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi xóa khu vực.', 'error');
  }
}

