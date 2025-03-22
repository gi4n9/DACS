const jwt = require("jsonwebtoken");

const userFromToken = (req, res, next) => {
  const token = req.cookies.token;
  console.log(`Token từ cookies (URL: ${req.url}):`, token);

  if (token) {
    try {
      const decoded = jwt.decode(token);
      console.log("Decoded token:", decoded);
      res.locals.user = {
        email: decoded.email,
        user_id: decoded.user_id,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Lỗi khi decode token:", error);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};

module.exports = userFromToken;
