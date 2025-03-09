const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../app/models/userModel");

class AuthService {
  // Đăng ký
  static async signup(username, email, password) {
    try {
      // Kiểm tra xem người dùng đã tồn tại chưa
      const existingUserByEmail = await User.findByEmail(email);
      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByEmail || existingUserByUsername) {
        throw new Error("Tên người dùng hoặc email đã tồn tại");
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo người dùng mới
      const userId = await User.create(username, email, hashedPassword);
      return { message: "Đăng ký thành công", userId };
    } catch (error) {
      throw error;
    }
  }

  // Đăng nhập
  static async login(email, password) {
    try {
      // Tìm người dùng theo email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }

      // Kiểm tra mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }

      // Tạo JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        "your_jwt_secret", // Thay bằng secret key của bạn
        { expiresIn: "1h" } // Token hết hạn sau 1 giờ
      );

      return { token, username: user.username };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
