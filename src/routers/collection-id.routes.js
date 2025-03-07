const express = require("express");
const router = express.Router();

// Dữ liệu mẫu sản phẩm
const products = [
  {
    id: "ao-thun-nam",
    name: "Áo Thun Nam Việt Devils - Marcus Rashford",
    price: "330.000đ",
    oldPrice: "389.000đ",
    discount: "-15%",
    image: "/img/localisz2.webp",
  },
];

// Route collection
router.get("/:id", (req, res) => {
  res.render("collection-id", {
    title: "Bộ sưu tập",
    products: products,
  });
});

module.exports = router;
