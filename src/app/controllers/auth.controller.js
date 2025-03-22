const axios = require("axios");
const jwt = require("jsonwebtoken");

const authController = {
  register: async (req, res) => {
    try {
      const { full_name, email, password, phone, address } = req.body;

      if (!full_name || !email || !password || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ thông tin",
        });
      }

      const userData = {
        full_name,
        email,
        password,
        phone,
        address,
      };

      const response = await axios.post(
        "https://fshop.nghienshopping.online/api/users/register",
        userData
      );

      return res.redirect("/login");
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Đã có lỗi xảy ra trong quá trình đăng ký",
        error: error.message,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp email và mật khẩu",
        });
      }

      const loginData = {
        email,
        password,
      };

      const response = await axios.post(
        "https://fshop.nghienshopping.online/api/users/login",
        loginData
      );

      // Lưu token vào cookies
      const token = response.data.token;
      console.log("Token sau khi đăng nhập thành công:", token);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        path: "/",
      });

      // Decode token để lấy role
      const decoded = jwt.decode(token);
      const userRole = decoded.role;

      // Redirect dựa trên role từ token
      if (userRole === "customer") {
        return res.redirect("/homepage");
      } else if (userRole === "admin") {
        return res.redirect("/admin/dashboard");
      } else {
        // Trường hợp role không hợp lệ
        return res.status(403).json({
          success: false,
          message: "Vai trò không hợp lệ",
        });
      }
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          message: error.response.data.message || "Đăng nhập thất bại",
          error: error.response.data,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Đã có lỗi xảy ra trong quá trình đăng nhập",
        error: error.message,
      });
    }
  },
};

module.exports = authController;
