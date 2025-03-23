const axios = require("axios");
const UserService = require("../../service/user.service");

module.exports.renderAdminPage = async (req, res) => {
  try {
    const users = await UserService.getAllUsers(req);

    // Render template dashboard với dữ liệu người dùng
    res.render("dashboard", {
      layout: false,
      title: "Trang Quản Trị",
      users: users.map((user) => user.getPublicInfo()), // Chỉ lấy thông tin công khai
    });
  } catch (error) {
    console.error("Lỗi khi tải trang dashboard:", error);
    res.status(500).render("errorpage", {
      title: "Lỗi",
      message: "Không thể tải trang quản trị. Vui lòng thử lại sau.",
    });
  }
};

module.exports.getAllUser = async (req, res) => {
  try {
    // Kiểm tra xem user có tồn tại và có role admin không
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền truy cập. Chỉ admin mới có thể xem danh sách user.",
      });
    }

    // Lấy token từ cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token không tồn tại",
      });
    }

    // Gọi API để lấy danh sách tất cả user
    const response = await axios.get(
      "${process.env.API_URL}/api/users",
      {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header
        },
      }
    );

    // Trả về danh sách user
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách user thành công",
      data: response.data, // Dữ liệu user từ API
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách user",
      error: error.response ? error.response.data : error.message,
    });
  }
};
