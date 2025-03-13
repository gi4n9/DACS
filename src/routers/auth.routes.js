const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../app/config/db");
const { authMiddleware } = require("../middlewares/authMiddlewares");

dotenv.config();
const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

// Đăng ký
router.post("/signup", async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Kiểm tra role hợp lệ
    const userRole = role === "admin" ? "admin" : "customer";

    // Mã hóa mật khẩu và lưu vào DB
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, userRole]
    );

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!users || users.length === 0) {
      // Có thể render lại trang login với thông báo lỗi
      return res
        .status(401)
        .render("login", { message: "Email hoặc mật khẩu không đúng" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .render("login", { message: "Email hoặc mật khẩu không đúng" });
    }

    const token = generateToken(user);
    // Lưu token vào cookie, nếu cần thiết
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000, // 1 giờ
    });

    // Chuyển hướng về /homepage sau khi đăng nhập thành công
    res.redirect("/homepage");
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Lỗi server", error });
  }
});

// Lấy thông tin cá nhân (Yêu cầu token)
router.get("/profile", authMiddleware, async (req, res) => {
  // Kiểm tra xem user đã đăng nhập chưa
  if (!req.user) {
    return res.redirect("/login"); // Redirect tới login nếu chưa đăng nhập
  }

  try {
    const [users] = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Render trang profile với thông tin user
    res.render("profile", {
      title: "HNG Store - Hồ sơ cá nhân",
      user: users[0], // Gửi thông tin user tới template
    });
  } catch (error) {
    console.error("Error in /me route:", error);
    res.status(500).render("error", {
      title: "Lỗi",
      message: "Lỗi server",
      error: error.message,
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token"); // Xóa token khỏi cookie
  res.redirect("/homepage"); // Chuyển hướng về trang chủ
});

module.exports = router;
