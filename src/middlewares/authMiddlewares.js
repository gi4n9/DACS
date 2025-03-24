const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  req.user = null;

  if (req.path === "/login" || req.path === "/signup") {
    return next();
  }

  if (!token) {
    return next(); // Không xóa cookie
  }

  try {
    const decoded = jwt.decode(token); // Dùng decode thay vì verify
    if (decoded) {
      req.user = {
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
      };
    }
    next();
  } catch (error) {
    console.error("Lỗi khi decode token:", error);
    next(); // Không xóa cookie
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
