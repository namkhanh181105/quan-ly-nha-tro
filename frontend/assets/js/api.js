/**
 * ============================================================================
 * TRUNG TÂM GỌI API FRONTEND (API SERVICE WRAPPER)
 * ============================================================================
 * Đóng gói Fetch API chuẩn hóa:
 * - Tự động quản lý mã bảo mật CSRF Token trong Session
 * - Gửi kèm Cookie xác thực (credentials: 'include')
 * - Quản lý trạng thái Loading và chống bấm lặp nút (Debounce)
 * - Xử lý mã lỗi HTTP 401 (chuyển hướng đăng nhập phù hợp) và 403 (từ chối quyền)
 * - Phân tích JSON phản hồi thống nhất { success, message, data }
 */

const API = {
  csrfToken: null,

  /**
   * Lấy CSRF Token từ máy chủ nếu chưa có (Lưu cả trong memory & sessionStorage)
   */
  async getCsrfToken() {
    if (this.csrfToken) return this.csrfToken;
    const stored = sessionStorage.getItem('app_csrf_token');
    if (stored) {
      this.csrfToken = stored;
      return stored;
    }
    try {
      const res = await fetch(CONFIG.API_URL + '/auth/csrf_token.php', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (data && data.success && data.data && data.data.csrf_token) {
        this.csrfToken = data.data.csrf_token;
        sessionStorage.setItem('app_csrf_token', this.csrfToken);
      }
    } catch (e) {
      console.warn('Không thể nạp CSRF token tự động:', e);
    }
    return this.csrfToken;
  },

  /**
   * Hiển thị lớp phủ loading
   */
  showLoading() {
    let loader = document.getElementById('global-loading');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'global-loading';
      loader.innerHTML = `
        <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Đang xử lý...</span>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.classList.add('show');
  },

  /**
   * Ẩn lớp phủ loading
   */
  hideLoading() {
    const loader = document.getElementById('global-loading');
    if (loader) {
      loader.classList.remove('show');
    }
  },

  /**
   * Hàm cốt lõi thực hiện yêu cầu Fetch
   *
   * @param {string} endpoint Đường dẫn API tương đối (VD: '/admin/rooms/list.php')
   * @param {object} options Cấu hình request (method, headers, body, showLoader, buttonToDisable)
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      showLoader = false,
      buttonToDisable = null
    } = options;

    if (showLoader) this.showLoading();

    // Vô hiệu hóa nút tạm thời để chống bấm đúp
    let originalBtnHtml = '';
    if (buttonToDisable) {
      buttonToDisable.disabled = true;
      originalBtnHtml = buttonToDisable.innerHTML;
      buttonToDisable.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...`;
    }

    try {
      // Chuẩn hóa đường dẫn endpoint: tự động bỏ tiền tố backend/api nếu có để không bị lặp URL
      let normalizedEndpoint = endpoint;
      if (normalizedEndpoint.startsWith('backend/api/')) {
        normalizedEndpoint = normalizedEndpoint.substring('backend/api'.length);
      } else if (normalizedEndpoint.startsWith('/backend/api/')) {
        normalizedEndpoint = normalizedEndpoint.substring('/backend/api'.length);
      }
      if (!normalizedEndpoint.startsWith('/') && !endpoint.startsWith('http')) {
        normalizedEndpoint = '/' + normalizedEndpoint;
      }
      const url = endpoint.startsWith('http') ? endpoint : CONFIG.API_URL + normalizedEndpoint;
      const fetchHeaders = { ...headers };

      // Đối với các phương thức thay đổi dữ liệu, gửi kèm CSRF Token
      let csrfToken = null;
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
        csrfToken = await this.getCsrfToken();
        if (csrfToken) {
          fetchHeaders['X-CSRF-Token'] = csrfToken;
        }
      }

      const fetchConfig = {
        method,
        credentials: 'include',
        headers: fetchHeaders
      };

      if (body) {
        if (body instanceof FormData) {
          if (csrfToken && !body.has('csrf_token')) {
            body.append('csrf_token', csrfToken);
          }
          fetchConfig.body = body;
          // Không đặt Content-Type thủ công khi dùng FormData để trình duyệt tự tạo boundary
        } else if (typeof body === 'object') {
          fetchHeaders['Content-Type'] = 'application/json';
          if (csrfToken && !body.csrf_token) {
            body.csrf_token = csrfToken;
          }
          fetchConfig.body = JSON.stringify(body);
        } else {
          fetchConfig.body = body;
        }
      }

      const response = await fetch(url, fetchConfig);

      // Xử lý hết hạn phiên đăng nhập (HTTP 401) - Ngoại trừ API xác thực hoặc trang đăng nhập
      const isAuthApi = endpoint.includes('/auth/');
      const isLoginPage = window.location.pathname.includes('/login.html');

      if (response.status === 401 && !isAuthApi && !isLoginPage) {
        const pathname = window.location.pathname;
        if (pathname.includes('/frontend/admin/')) {
          CONFIG.showToast('Phiên làm việc quản trị đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
          setTimeout(() => {
            window.location.href = CONFIG.BASE_URL + '/frontend/admin/login.html';
          }, 1200);
        } else if (pathname.includes('/frontend/tenant/')) {
          CONFIG.showToast('Phiên làm việc cư dân đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
          setTimeout(() => {
            window.location.href = CONFIG.BASE_URL + '/frontend/tenant/login.html';
          }, 1200);
        } else if (pathname.includes('/frontend/customer/')) {
          CONFIG.showToast('Yêu cầu đăng nhập tài khoản khách hàng.', 'warning');
          setTimeout(() => {
            window.location.href = CONFIG.BASE_URL + '/frontend/public/login.html';
          }, 1200);
        }
      }

      // Xử lý từ chối quyền truy cập (HTTP 403) - Ngoại trừ API xác thực
      if (response.status === 403 && !isAuthApi) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.message && errorData.message.includes('CSRF')) {
          this.csrfToken = null;
          sessionStorage.removeItem('app_csrf_token');
        }
        CONFIG.showToast(errorData.message || 'Bạn không có quyền thực hiện thao tác này.', 'error');
        throw new Error(errorData.message || 'Truy cập bị từ chối.');
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('API trả về dữ liệu không phải JSON hợp lệ');
        throw new Error('Máy chủ phản hồi dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
      }

      // Cập nhật lại CSRF token nếu backend sinh mã mới
      if (data && data.data && data.data.csrf_token) {
        this.csrfToken = data.data.csrf_token;
        sessionStorage.setItem('app_csrf_token', this.csrfToken);
      }

      return data;
    } catch (error) {
      console.error(`Lỗi API [${method} ${endpoint}]:`, error);
      throw error;
    } finally {
      if (showLoader) this.hideLoading();
      if (buttonToDisable) {
        buttonToDisable.disabled = false;
        buttonToDisable.innerHTML = originalBtnHtml;
      }
    }
  },

  /**
   * Gọi API GET
   */
  get(endpoint, params = {}, options = {}) {
    let url = endpoint;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    }
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    return this.request(url, { method: 'GET', ...options });
  },

  /**
   * Gọi API POST (JSON hoặc FormData)
   */
  post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  },

  /**
   * Gọi API DELETE
   */
  delete(endpoint, body = {}, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  }
};

/**
 * ============================================================================
 * TRỢ THỦ XÁC THỰC QUYỀN TRUY CẬP (AUTH GUARD HELPER)
 * ============================================================================
 */
const Auth = {
  async requireAdmin() {
    try {
      const res = await API.get('/auth/admin_me.php');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (e) {}
    window.location.href = CONFIG.BASE_URL + '/frontend/admin/login.html';
    return null;
  },

  async requireTenant() {
    try {
      const res = await API.get('/auth/tenant_me.php');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (e) {}
    window.location.href = CONFIG.BASE_URL + '/frontend/tenant/login.html';
    return null;
  },

  async requireUser() {
    try {
      const res = await API.get('/auth/user_me.php');
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (e) {}
    window.location.href = CONFIG.BASE_URL + '/frontend/public/login.html';
    return null;
  }
};

window.API = API;
window.Auth = Auth;


