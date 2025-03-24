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
    res.clearCookie("token");
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Chỉ lấy id, email, role từ token
    next();
  } catch (error) {
    res.clearCookie("token");
    next();
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
