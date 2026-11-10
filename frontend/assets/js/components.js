/**
 * ============================================================================
 * QUẢN LÝ NẠP COMPONENT GIAO DIỆN (COMPONENTS LOADER)
 * ============================================================================
 * Nạp động các đoạn mã HTML dùng chung (Header, Footer, Sidebar),
 * đánh dấu menu đang kích hoạt (Active Nav), hiển thị tên người dùng và
 * gắn sự kiện Đăng xuất.
 */

const Components = {
  /**
   * Nạp tệp HTML component vào selector tương ứng
   */
  async load(targetSelector, componentPath) {
    const el = document.querySelector(targetSelector);
    if (!el) return;

    try {
      const fullPath = CONFIG.BASE_URL + '/frontend/components/' + componentPath;
      const res = await fetch(fullPath);
      if (!res.ok) throw new Error(`Không thể nạp component: ${componentPath}`);
      const html = await res.text();
      el.innerHTML = html;
      this.initAfterLoad(targetSelector);
    } catch (e) {
      console.error('Lỗi nạp component:', e);
    }
  },

  /**
   * Khởi tạo logic sau khi chèn component vào DOM
   */
  initAfterLoad(targetSelector) {
    this.highlightActiveNav();
    this.initUserSession(targetSelector);
  },

  /**
   * Tự động tô đậm menu đang truy cập dựa theo đường dẫn URL
   */
  highlightActiveNav() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.admin-nav-link, .tenant-nav-link, .public-navbar .nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.endsWith(href)) {
        link.classList.add('active');
      }
    });
  },

  /**
   * Lấy thông tin phiên làm việc và hiển thị trên thanh tiêu đề
   */
  async initUserSession(targetSelector) {
    // 1. Phân hệ Quản trị (Admin)
    if (targetSelector === '#admin-header' || targetSelector === '#admin-sidebar') {
      try {
        const res = await API.get('/auth/admin_me.php');
        if (res && res.success && res.data) {
          const admin = res.data;
          const nameEl = document.getElementById('admin-fullname-display');
          if (nameEl) nameEl.textContent = admin.fullname;
          const roleEl = document.getElementById('admin-role-badge');
          if (roleEl) {
            roleEl.textContent = (admin.role === 'superadmin') ? 'Superadmin' : 'Quản trị viên';
          }
          // Ẩn menu Tài khoản nếu không phải Superadmin
          if (admin.role !== 'superadmin') {
            const accMenu = document.getElementById('menu-admin-accounts');
            if (accMenu) accMenu.style.display = 'none';
          }
        }
      } catch (e) {}

      // Gắn sự kiện đăng xuất Admin
      const logoutBtn = document.getElementById('btnAdminLogout');
      if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = 'true';
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
            await API.post('/auth/admin_logout.php');
            window.location.href = CONFIG.BASE_URL + '/frontend/admin/login.html';
          }
        });
      }
    }

    // 2. Phân hệ Cư dân (Tenant Portal)
    if (targetSelector === '#tenant-header' || targetSelector === '#tenant-sidebar') {
      try {
        const res = await API.get('/auth/tenant_me.php');
        if (res && res.success && res.data) {
          const tenant = res.data;
          const nameEl = document.getElementById('tenant-name-display');
          if (nameEl) nameEl.textContent = tenant.fullname;
          const roomEl = document.getElementById('tenant-room-badge');
          if (roomEl) {
            roomEl.textContent = tenant.room_number ? `Phòng ${tenant.room_number}` : 'Chưa xếp phòng';
          }
        }
      } catch (e) {}

      // Gắn sự kiện đăng xuất Cư dân
      const logoutBtn = document.getElementById('btnTenantLogout');
      if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = 'true';
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          if (confirm('Bạn có muốn đăng xuất Cổng cư dân?')) {
            await API.post('/auth/tenant_logout.php');
            window.location.href = CONFIG.BASE_URL + '/frontend/tenant/login.html';
          }
        });
      }
    }

    // 3. Phân hệ Công khai / Khách hàng (Public / Customer)
    if (targetSelector === '#public-header') {
      // Chuẩn hóa đường dẫn chính xác theo Base URL
      const setHref = (id, url) => {
        const el = document.getElementById(id);
        if (el) el.href = url;
      };
      setHref('topbarTenantBtn', CONFIG.BASE_URL + '/frontend/tenant/login.html');
      setHref('topbarAdminBtn', CONFIG.BASE_URL + '/frontend/admin/login.html');
      setHref('navBrand', CONFIG.BASE_URL + '/frontend/public/index.html');
      setHref('navHome', CONFIG.BASE_URL + '/frontend/public/index.html');
      setHref('navRooms', CONFIG.BASE_URL + '/frontend/public/rooms.html');
      setHref('navContact', CONFIG.BASE_URL + '/frontend/public/contact.html');
      setHref('navLogin', CONFIG.BASE_URL + '/frontend/public/login.html');
      setHref('navRegister', CONFIG.BASE_URL + '/frontend/public/register.html');
      setHref('navTenantLogin', CONFIG.BASE_URL + '/frontend/tenant/login.html');
      setHref('navAdminLogin', CONFIG.BASE_URL + '/frontend/admin/login.html');

      try {
        const res = await API.get('/auth/user_me.php');
        if (res && res.success && res.data) {
          const user = res.data;
          const guestNav = document.getElementById('nav-guest-actions');
          const userNav = document.getElementById('nav-user-actions');
          const userNameEl = document.getElementById('customer-name-display');
          if (guestNav) guestNav.style.display = 'none';
          if (userNav) userNav.style.display = 'flex';
          if (userNameEl) userNameEl.textContent = user.fullname;
        }
      } catch (e) {}

      // Gắn sự kiện đăng xuất Khách hàng
      const logoutBtn = document.getElementById('btnCustomerLogout');
      if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = 'true';
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          await API.post('/auth/user_logout.php');
          window.location.reload();
        });
      }
    }

    // 4. Chân trang công khai (Public Footer) - Chuẩn hóa link điều hướng
    if (targetSelector === '#public-footer') {
      const footerLinks = document.querySelectorAll('#public-footer a');
      footerLinks.forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          if (href === 'index.html') a.href = CONFIG.BASE_URL + '/frontend/public/index.html';
          else if (href === 'rooms.html') a.href = CONFIG.BASE_URL + '/frontend/public/rooms.html';
          else if (href === 'contact.html') a.href = CONFIG.BASE_URL + '/frontend/public/contact.html';
          else if (href === 'login.html') a.href = CONFIG.BASE_URL + '/frontend/public/login.html';
          else if (href.includes('tenant/login.html')) a.href = CONFIG.BASE_URL + '/frontend/tenant/login.html';
          else if (href.includes('admin/login.html')) a.href = CONFIG.BASE_URL + '/frontend/admin/login.html';
        }
      });
    }
  }
};

// Tự động nạp components tương ứng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', async function () {
  if (document.getElementById('public-header') && !document.querySelector('#public-header .public-header-wrapper')) {
    await Components.load('#public-header', 'public-header.html');
  }
  if (document.getElementById('public-footer') && !document.querySelector('#public-footer footer')) {
    await Components.load('#public-footer', 'public-footer.html');
  }
  if (document.getElementById('admin-sidebar') && !document.querySelector('#admin-sidebar .admin-sidebar')) {
    await Components.load('#admin-sidebar', 'admin-sidebar.html');
  }
  if (document.getElementById('admin-header') && !document.querySelector('#admin-header .admin-header')) {
    await Components.load('#admin-header', 'admin-header.html');
  }
  if (document.getElementById('tenant-sidebar') && !document.querySelector('#tenant-sidebar .tenant-sidebar')) {
    await Components.load('#tenant-sidebar', 'tenant-sidebar.html');
  }
  if (document.getElementById('tenant-header') && !document.querySelector('#tenant-header .tenant-header')) {
    await Components.load('#tenant-header', 'tenant-header.html');
  }
});


