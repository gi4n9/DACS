// routes/dashboard.js
const express = require("express");
const router = express.Router();
const UserService = require("../service/user.service");

// Route cho trang dashboard
router.get("/", async (req, res) => {
  try {
    // Lấy danh sách người dùng từ API
    const users = await UserService.getAllUsers();

    // Render template dashboard với dữ liệu người dùng
    res.render("dashboard", {
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
});

module.exports = router;
