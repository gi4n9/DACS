const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.decode(token); // Dùng decode thay vì verify
    res.locals.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error("Lỗi khi decode token:", error);
    res.locals.user = null;
    next();
  }
};

module.exports = checkAuth;
