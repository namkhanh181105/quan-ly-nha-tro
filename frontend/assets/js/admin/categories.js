/**
 * ============================================================================
 * JAVASCRIPT QUẢN LÝ LOẠI PHÒNG (ADMIN CATEGORIES JS)
 * ============================================================================
 * - Nạp danh sách: GET backend/api/admin/categories/list.php
 * - Xem chi tiết sửa: GET backend/api/admin/categories/detail.php
 * - Thêm mới: POST backend/api/admin/categories/create.php
 * - Cập nhật: POST backend/api/admin/categories/update.php
 * - Xóa: POST backend/api/admin/categories/delete.php (Chặn nếu có phòng liên kết)
 */

let categoryModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');
  
  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Quản Lý Loại Phòng';

  categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
  await loadCategories();

  // Nút mở modal thêm
  document.getElementById('btnAddCategory').addEventListener('click', () => {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModalTitle').textContent = 'Thêm loại phòng mới';
    categoryModal.show();
  });

  // Submit form thêm/sửa
  document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveCategory();
  });
});

async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải...</td></tr>';

  try {
    const res = await API.get('/admin/categories/list.php');
    if (res && res.success && res.data) {
      const items = res.data;
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Chưa có loại phòng nào.</td></tr>';
        return;
      }

      let html = '';
      items.forEach(c => {
        html += `
          <tr>
            <td><span class="text-muted fw-bold">#${c.id}</span></td>
            <td><strong>${CONFIG.escapeHtml(c.name)}</strong></td>
            <td><code>${CONFIG.escapeHtml(c.slug)}</code></td>
            <td class="small text-muted">${CONFIG.escapeHtml(c.description || 'Chưa có mô tả')}</td>
            <td><span class="badge bg-primary-subtle text-primary border">${c.room_count || 0} phòng</span></td>
            <td class="text-center">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-edit-cat" data-id="${c.id}" title="Sửa"><i class="bi bi-pencil-square"></i></button>
                <button class="btn btn-outline-danger btn-delete-cat" data-id="${c.id}" data-name="${CONFIG.escapeHtml(c.name)}" title="Xóa"><i class="bi bi-trash"></i></button>
              </div>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;

      // Gắn sự kiện nút Sửa và Xóa
      tbody.querySelectorAll('.btn-edit-cat').forEach(b => {
        b.addEventListener('click', () => openEditCategory(b.getAttribute('data-id')));
      });
      tbody.querySelectorAll('.btn-delete-cat').forEach(b => {
        b.addEventListener('click', () => handleDeleteCategory(b.getAttribute('data-id'), b.getAttribute('data-name')));
      });
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-danger">Lỗi khi tải danh sách loại phòng.</td></tr>';
  }
}
///admin/categories/detail.php
async function openEditCategory(id) {
  try {
    API.showLoading();
    //Gửi request GET ngầm kèm ID loại phòng để lấy chi tiết từ backend/api/.. (detail.php)
    const res = await API.get('/admin/categories/detail.php', { id });
    if (res && res.success && res.data) {
      const c = res.data;
         // Đổ dữ liệu từ CSDL vào từng ô input của Modal
      document.getElementById('categoryId').value = c.id;
      document.getElementById('categoryName').value = c.name;
      document.getElementById('categorySlug').value = c.slug;
      document.getElementById('categoryDescription').value = c.description || '';
      document.getElementById('categoryModalTitle').textContent = `Sửa loại phòng #${c.id}`;
      categoryModal.show();   //mở modal
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi lấy thông tin loại phòng.', 'error');
  } finally {
    API.hideLoading();
  }
}
//Bấm nút "Lưu loại phòng" (Submit Form)
async function handleSaveCategory() {
  const form = document.getElementById('categoryForm');
  const btnSave = document.getElementById('btnSaveCategory');
  const id = document.getElementById('categoryId').value;
  const isEdit = Boolean(id); // Nếu có ID => Đây là chế độ SỬA

  const payload = {
    id: id ? parseInt(id) : undefined,
    name: document.getElementById('categoryName').value.trim(),
    slug: document.getElementById('categorySlug').value.trim(),
    description: document.getElementById('categoryDescription').value.trim()
  };
 // Phân luồng endpoint API: Có id thì gọi update.php,không có gọi create.php(backend/api/admin/categories/update.php)
  const endpoint = isEdit ? '/admin/categories/update.php' : '/admin/categories/create.php';

  try {
    const res = await API.post(endpoint, payload, { buttonToDisable: btnSave });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Lưu thành công!', 'success');
      categoryModal.hide();
      await loadCategories();
    } else {
      CONFIG.showToast(res.message || 'Lỗi khi lưu loại phòng.', 'error');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi lưu loại phòng.', 'error');
  }
}

async function handleDeleteCategory(id, name) {
  if (!confirm(`Bạn có chắc chắn muốn xóa loại phòng "${name}"?`)) return;
//Trình duyệt gửi gói tin HTTP POST chứa { id: ... } đến endpoint API xử lý xóa: backend/api/admin/categories/delete.php.
  try {
    const res = await API.post('/admin/categories/delete.php', { id: parseInt(id) });
    if (res && res.success) {
      CONFIG.showToast(res.message || 'Xóa loại phòng thành công.', 'success');
      await loadCategories();
    } else {
      CONFIG.showToast(res.message || 'Không thể xóa loại phòng này.', 'warning');
    }
  } catch (e) {
    CONFIG.showToast('Lỗi kết nối khi xóa loại phòng.', 'error');
  }
}

