/**
 * ==============================================================================
 * JAVASCRIPT GỬI LIÊN HỆ CÔNG KHAI (PUBLIC CONTACT FORM)
 * ==============================================================================
 * File: frontend/assets/js/public/contact.js
 * Nhiệm vụ:
 * 1. Kiểm tra nếu khách hàng đã đăng nhập tài khoản (GET backend/api/auth/user_me.php):
 *    - Tự động điền họ tên, số điện thoại, email vào các ô input.
 * 2. Bắt sự kiện submit form #contactForm:
 *    - Thu thập name, phone, email, subject, message.
 *    - Gọi POST backend/api/public/contacts/create.php.
 *    - Nhận phản hồi JSON: hiển thị Toast thông báo và làm mới trường nội dung.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', async function () {
  // ============================================================================
  // HÀM 1: TỰ ĐỘNG ĐIỀN THÔNG TIN NẾU KHÁCH HÀNG ĐÃ ĐĂNG NHẬP
  // ============================================================================
  try {
    const res = await API.get('backend/api/auth/user_me.php');
    if (res.success && res.data) {
      const u = res.data;
      if (u.fullname) document.getElementById('contactName').value = u.fullname;
      if (u.phone) document.getElementById('contactPhone').value = u.phone;
      if (u.email) document.getElementById('contactEmail').value = u.email;
    }
  } catch (e) {
    // Không đăng nhập thì người dùng tự gõ
  }

  // ============================================================================
  // SỰ KIỆN FORM: SUBMIT #contactForm (GỬI TIN NHẮN LIÊN HỆ)
  // ============================================================================
  /**
   * Bắt sự kiện submit form #contactForm
   * Luồng:
   * 1. Thu thập dữ liệu input #contactName, #contactPhone, #contactEmail, #contactSubject, #contactMessage.
   * 2. Gọi POST backend/api/public/contacts/create.php.
   * 3. Xử lý kết quả JSON:
   *    - Thành công: Hiển thị Toast thông báo thành công, xóa trắng #contactSubject và #contactMessage.
   *    - Thất bại: Hiển thị Toast thông báo lỗi.
   */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = document.getElementById('btnSubmitContact');
      const originalBtnHtml = submitBtn.innerHTML;

      const payload = {
        fullname: document.getElementById('contactName').value.trim(),
        name: document.getElementById('contactName').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        subject: document.getElementById('contactSubject').value.trim(),
        message: document.getElementById('contactMessage').value.trim()
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang gửi tin nhắn...';

        const res = await API.post('backend/api/public/contacts/create.php', payload);

        if (res.success) {
          Utils.showToast(
            res.message || 'Cảm ơn bạn! Tin nhắn liên hệ đã được gửi thành công đến ban quản lý.',
            'success'
          );
          // Giữ họ tên và SĐT, chỉ xóa tiêu đề và nội dung vừa gửi
          document.getElementById('contactSubject').value = '';
          document.getElementById('contactMessage').value = '';
        } else {
          Utils.showToast(res.message || 'Không thể gửi liên hệ. Vui lòng kiểm tra lại.', 'danger');
        }
      } catch (err) {
        console.error('Lỗi khi gửi liên hệ:', err);
        Utils.showToast('Lỗi máy chủ khi gửi liên hệ. Vui lòng gọi trực tiếp hotline.', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});

