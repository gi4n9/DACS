const express = require("express");
const router = express.Router();
const adminController = require("../app/controllers/admin.controller");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddlewares");

router.use(authMiddleware); // Bắt buộc đăng nhập
router.use(adminMiddleware); // Bắt buộc là admin

// Trang tổng quan Admin
router.get("/dashboard", adminController.renderAdminPage);

// Lấy danh sách user
router.get("/users", adminController.getAllUser);

// Thêm sản phẩm mới
router.post("/products", adminController.createProduct);

// Cập nhật sản phẩm
router.put("/products/:id", adminController.updateProduct);

// Xóa sản phẩm
router.delete("/products/:id", adminController.deleteProduct);

module.exports = router;
