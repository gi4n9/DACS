    const express = require('express');
    const router = express.Router();

    // Dữ liệu mẫu sản phẩm
    const product = {
        name: "Áo Thun Nam Việt Devils - Marcus GrabFood",
        oldPrice: "389.000đ",
        price: "330.000đ",
        discount: "-15%",
        description: "Vải Cotton Compact",
        shipping: "Miễn phí - Giao chậm 1-2 ngày",
        image: "/images/shirt.png", // Ảnh chính
        additionalImages: [ // Thêm ảnh chi tiết
            "/images/shirt1.png",
            "/images/shirt2.png",
            "/images/shirt3.png"
        ],
        colors: ["#ffffff", "#000000", "#ff5733"],
        sizes: ["S", "M", "L", "XL", "2XL", "3XL"]
    };
    
    router.get("/", (req, res) => {
        res.render("product", {
            title: "Sản Phẩm",
            product: product
        });
    });
    

    module.exports = router;
