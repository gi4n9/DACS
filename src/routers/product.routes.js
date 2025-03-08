const express = require("express");
const router = express.Router();

// Dữ liệu mẫu sản phẩm
const product = {
  id: 1,
  name: "Áo Thun Nam Việt Devils - Marcus Rashford",
  oldPrice: "389.000đ",
  price: "330.000đ",
  discount: "-15%",
  description: "Vải Cotton Compact",
  shipping: "Miễn phí - Giao chậm 1-2 ngày",
  discount: 15,
  images: [
    // Nhiều ảnh chính
    "/img/localisz2.webp",
    "/img/_CMM8493_24.webp",
  ],
  colors: ["#ffffff", "#000000", "#ff5733"],
  sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
};

router.get("/:id", (req, res) => {
  res.render("product", {
    title: "Sản Phẩm",
    product: product,
  });
});

module.exports = router;
