const express = require("express");
const router = express.Router();
const db = require("../app/config/db");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddlewares");

router.use(authMiddleware); // Bắt buộc đăng nhập
router.use(adminMiddleware); // Bắt buộc là admin

// Trang tổng quan Admin
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query("SELECT COUNT(*) AS total FROM users");
    const [orders] = await db.query(
      "SELECT COUNT(*) AS total FROM orders WHERE DATE(created_at) = CURDATE()"
    );

    res.render("adminDashboard", {
      totalUsers: users[0].total,
      ordersToday: orders[0].total,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Lấy danh sách user
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, email, role FROM users");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

module.exports = router;
