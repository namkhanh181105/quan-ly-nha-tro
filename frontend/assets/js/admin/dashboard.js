/**
 * ============================================================================
 * JAVASCRIPT BẢNG ĐIỀU KHIỂN QUẢN TRỊ (ADMIN DASHBOARD JS)
 * ============================================================================
 * Gọi API GET backend/api/admin/dashboard/stats.php để lấy các chỉ số thống kê
 * thực tế từ cơ sở dữ liệu và hiển thị lên các thẻ số liệu thống kê.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await Components.load('#admin-sidebar', 'admin-sidebar.html');
  await Components.load('#admin-header', 'admin-header.html');

  const pageTitleEl = document.getElementById('page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'Bảng Điều Khiển Tổng Quan';

  await loadDashboardStats();

  const btnRefresh = document.getElementById('btnRefreshStats');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      await loadDashboardStats();
      CONFIG.showToast('Đã làm mới số liệu thống kê thành công.', 'info');
    });
  }
});

async function loadDashboardStats() {
  try {
    API.showLoading();
    const res = await API.get('/admin/dashboard/stats.php');
    if (res && res.success && res.data) {
      const s = res.data;

      // 1. Số liệu phòng trọ
      document.getElementById('statTotalRooms').textContent = s.total_rooms;
      document.getElementById('statRentedRooms').textContent = s.rented_rooms;
      document.getElementById('statAvailableRooms').textContent = s.available_rooms;
      document.getElementById('statActiveTenants').textContent = s.active_tenants;

      const rate = s.total_rooms > 0 ? Math.round((s.rented_rooms / s.total_rooms) * 100) : 0;
      document.getElementById('statOccupancyRate').textContent = `Tỷ lệ lấp đầy: ${rate}%`;

      // 2. Tài chính & hóa đơn
      document.getElementById('statRevenueMonth').textContent = `${s.month}/${s.year}`;
      document.getElementById('statMonthlyRevenue').textContent = CONFIG.formatCurrency(s.revenue_current_month);
      document.getElementById('statMonthlyDebt').textContent = CONFIG.formatCurrency(s.debt_current_month);
      document.getElementById('statUnpaidCount').textContent = `${s.unpaid_invoices_count} HĐ chưa nộp`;
      document.getElementById('statPendingProofs').textContent = s.pending_proofs_count;

      // 3. Nhiệm vụ chờ xử lý
      document.getElementById('statPendingBookings').textContent = s.pending_bookings;
      document.getElementById('statPendingMaintenance').textContent = s.pending_maintenance;
      document.getElementById('statExtensionRequests').textContent = s.extension_requests;
    }
  } catch (e) {
    CONFIG.showToast('Lỗi khi tải dữ liệu thống kê Dashboard.', 'error');
  } finally {
    API.hideLoading();
  }
}

