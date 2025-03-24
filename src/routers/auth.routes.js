const express = require("express");
const dotenv = require("dotenv");
const db = require("../app/config/db");
const { authMiddleware } = require("../middlewares/authMiddlewares");
const authController = require("../app/controllers/auth.controller");
const userController = require("../app/controllers/user.controller");

dotenv.config();
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

// Đăng ký
router.post("/register", authController.register);

// Đăng nhập
router.post("/login", authController.login);

// Lấy thông tin cá nhân (Yêu cầu token)
router.get("/profile", authMiddleware, userController.getUserInfo);

router.get("/logout", (req, res) => {
  res.clearCookie("token"); // Xóa token khỏi cookie
  res.redirect("/homepage"); // Chuyển hướng về trang chủ
});

module.exports = router;
