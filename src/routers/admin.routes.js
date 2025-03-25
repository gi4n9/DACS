const express = require("express");
const router = express.Router();
const adminController = require("../app/controllers/admin.controller");

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
