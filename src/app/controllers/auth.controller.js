const axios = require("axios");
const jwt = require("jsonwebtoken");

const authController = {
  register: async (req, res) => {
    try {
      const { fullname, email, password, phone, address } = req.body;

      if (!fullname || !email || !password || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đầy đủ thông tin",
        });
      }

      const userData = {
        fullname,
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
      });

      return res.redirect("/homepage");
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
