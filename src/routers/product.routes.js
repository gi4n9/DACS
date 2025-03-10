const express = require("express");
const router = express.Router();

// Product data based on the image
const products = [
  {
    id: 1,
    name: "Áo Thun Nam Cotton 220GSM",
    oldPrice: "179.000đ",
    price: "161.000đ",
    discount: 10,
    description: "Chất liệu vải co giãn 4 chiều, thấm hút tốt và thoáng mát",
    shipping: "Miễn phí - Giao chậm 1-2 ngày",
    images: [
      "/img/products/pd1.1.webp",
      "/img/products/dp1.2.webp"
    ],
    colors: ["#e8e6cf", "#d4d4d4", "#000000", "#0d47a1"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    rating: 4.8,
    reviewCount: 175
  },
  {
    id: 2,
    name: "Áo dài tay thể thao k99",
    oldPrice: "209.000đ",
    price: "188.000đ",
    discount: 10,
    description: "Chất liệu vải co giãn 4 chiều, thấm hút tốt và thoáng mát",
    shipping: "Miễn phí - Giao chậm 1-2 ngày",
    images: [
      "/img/products/pd2.1.webp",
      "/img/products/pd2.2.webp"
    ],
    colors: ["#ffffff", "#0d47a1"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    rating: 5.0,
    reviewCount: 4
  },
  {
    id: 3,
    name: "Áo thun Nam Thể thao Phối bộ cổ",
    price: "249.000đ",
    discount: 30,
    description: "Chất liệu vải co giãn 4 chiều, thấm hút tốt và thoáng mát",
    shipping: "Miễn phí - Giao chậm 1-2 ngày",
    images: [
      "/img/products/pd3.1.webp",
      "/img/products/pd3.2).webp"
    ],
    colors: ["#000000", "#0d47a1", "#ff0000"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    rating: 5.0,
    reviewCount: 5
  },
  {
    id: 4,
    name: "Áo thun nam Cotton Compact",
    oldPrice: "259.000đ",
    price: "219.000đ",
    discount: 15,
    description: "Chất liệu vải co giãn 4 chiều, thấm hút tốt và thoáng mát",
    shipping: "Miễn phí - Giao chậm 1-2 ngày",
    images: [
      "/img/products/pd4.1.webp",
      "/img/products/pd4.2.jpg  "
    ],
    colors: ["#000000", "#0d47a1", "#ffffff"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    rating: 4.8,
    reviewCount: 1245
  }
];

// Get product by ID and generate recommended products (all other products)
router.get("/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  
  // Find the current product
  const currentProduct = products.find(p => p.id === productId);
  
  if (!currentProduct) {
    return res.status(404).send("Product not found");
  }
  
  // Get all other products as recommendations
  const recommendedProducts = products.filter(p => p.id !== productId);
  
  res.render("product", {
    title: currentProduct.name,
    product: currentProduct,
    recommendedProducts: recommendedProducts
  });
});

module.exports = router;