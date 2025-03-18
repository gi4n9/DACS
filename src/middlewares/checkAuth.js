const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.cookies.token; // Lấy token từ cookie

  if (!token) {
    res.locals.user = null; // Không có user
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded; // Lưu user vào `res.locals`
    next();
  } catch (error) {
    res.locals.user = null;
    next();
  }
};

module.exports = checkAuth;
