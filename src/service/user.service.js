// service/userService.js
const axios = require("axios");
const User = require("../app/models/userModel");

class UserService {
  static async getAllUsers(req) {
    try {
      // Lấy token từ cookie
      const cookies = req.headers.cookie;
      if (!cookies) {
        throw new Error("Không tìm thấy cookie chứa token");
      }

      // Giả sử token được lưu trong cookie với tên 'token'
      const token = cookies
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Không tìm thấy token trong cookie");
      }

      const response = await axios.get(
        "https://fshop.nghienshopping.online/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return User.fromApiData(response.data);
    } catch (error) {
      throw new Error("Không thể lấy danh sách người dùng: " + error.message);
    }
  }

  static async getUserById(userId, req) {
    try {
      const cookies = req.headers.cookie;
      if (!cookies) {
        throw new Error("Không tìm thấy cookie chứa token");
      }

      const token = cookies
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Không tìm thấy token trong cookie");
      }

      const response = await axios.get(
        `https://fshop.nghienshopping.online/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiData = response.data;
      if (!apiData || !apiData.data) {
        throw new Error("Dữ liệu không hợp lệ");
      }
      return new User(apiData.data);
    } catch (error) {
      throw new Error(
        `Không thể lấy người dùng ID ${userId}: ` + error.message
      );
    }
  }
}

module.exports = UserService;
