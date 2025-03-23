// userModel.js
class User {
  constructor(data) {
    this.userId = data.user_id;
    this.fullName = data.full_name;
    this.email = data.email;
    this.passwordHash = data.password_hash;
    this.phone = data.phone;
    this.address = data.address;
    this.role = data.role;
    this.status = data.status;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
    this.lastLogin = data.last_login ? new Date(data.last_login) : null;
  }

  // Phương thức kiểm tra trạng thái hoạt động
  isActive() {
    return this.status === "active";
  }

  // Phương thức kiểm tra vai trò quản trị
  isAdmin() {
    return this.role === "admin";
  }

  // Phương thức lấy thông tin cơ bản (loại bỏ thông tin nhạy cảm như password)
  getPublicInfo() {
    return {
      userId: this.userId,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      role: this.role,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
    };
  }

  // Phương thức định dạng ngày tạo tài khoản
  formatCreatedAt() {
    return this.createdAt.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Phương thức định dạng ngày đăng nhập cuối
  formatLastLogin() {
    if (!this.lastLogin) return "Chưa đăng nhập";
    return this.lastLogin.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Phương thức kiểm tra email hợp lệ (đơn giản)
  isEmailValid() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  // Phương thức cập nhật thời gian đăng nhập cuối
  updateLastLogin() {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }
}

// Phương thức static để chuyển đổi dữ liệu API thành mảng User instances
User.fromApiData = function (apiData) {
  if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
    console.warn("Dữ liệu API không hợp lệ:", apiData);
    return [];
  }
  return apiData.data.map((userData) => new User(userData));
};

module.exports = User;
