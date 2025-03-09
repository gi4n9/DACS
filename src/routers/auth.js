const express = require("express");
const router = express.Router();
const AuthService = require("../service/authService");

// Route hiển thị form đăng ký
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Đăng Ký" });
});

// Route xử lý đăng ký
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const result = await AuthService.signup(username, email, password);
    res.redirect("/login");
  } catch (error) {
    res.render("signup", { title: "Đăng Ký", error: error.message });
  }
});

// Route hiển thị form đăng nhập
router.get("/login", (req, res) => {
  res.render("login", { title: "Đăng Nhập" });
});

// Route xử lý đăng nhập
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { token, username } = await AuthService.login(email, password);
    res.redirect("/"); // Chuyển hướng về trang chủ
  } catch (error) {
    res.render("login", { title: "Đăng Nhập", error: error.message });
  }
});

module.exports = router;
