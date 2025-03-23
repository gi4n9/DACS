// routes/dashboard.js
const express = require("express");
const router = express.Router();
const UserService = require("../service/user.service");
const ProductService = require("../service/productService");

// Route cho trang dashboard
router.get("/", async (req, res) => {
  try {
    // Lấy danh sách người dùng từ API
    const users = await UserService.getAllUsers(req);
    const products = await ProductService.getAllProductsForAdmin(req);
    console.log(products);

    // Render template dashboard với dữ liệu người dùng
    res.render("dashboard", {
      title: "Trang Quản Trị",
      users: users.map((user) => user.getPublicInfo()),
      products: products.map((product) => ({
        id: product.productId,
        name: product.name,
        price: product.formatPrice(),
        stock: product.stock,
        isInStock: product.isInStock(),
      })),
    });
  } catch (error) {
    console.error("Lỗi khi tải trang dashboard:", error);
    res.status(500).render("errorpage", {
      title: "Lỗi",
      message: "Không thể tải trang quản trị. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
