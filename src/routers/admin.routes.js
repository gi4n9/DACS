const express = require("express");
const router = express.Router();
const db = require("../app/config/db");
const adminController = require("../app/controllers/admin.controller");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddlewares");

router.use(authMiddleware); // Bắt buộc đăng nhập
router.use(adminMiddleware); // Bắt buộc là admin

// Trang tổng quan Admin
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  adminController.renderAdminPage
);

module.exports = router;
