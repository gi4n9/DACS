const express = require("express");
const router = express.Router();
const ProductService = require("../service/productService");

router.get("/", async (req, res) => {
    try {
        const searchName = req.query.name;
        if (!searchName) {
            return res.status(400).render("errorpage", {
                title: "Lỗi tìm kiếm",
                message: "Vui lòng nhập từ khóa tìm kiếm.",
            });
        }

        // Log từ khóa tìm kiếm để debug
        console.log(`Searching for products with name: "${searchName}"`);

        const matchedProducts = await ProductService.searchProductsByName(searchName);
        
        // Log số lượng sản phẩm tìm được
        console.log(`Found ${matchedProducts.length} products`);

        if (matchedProducts.length === 0) {
            return res.status(404).render("errorpage", {
                title: "Không tìm thấy",
                message: `Không tìm thấy sản phẩm nào với từ khóa "${searchName}".`,
            });
        }

        const formattedProducts = matchedProducts.map((product) => ({
            id: product.productId || "unknown",
            name: product.name || "Không có tên",
            price: product.formatPrice() || "0 đ",
            oldPrice: product.formatOriginPrice() || null,
            discount: product.calculateDiscount() || null,
            images: product.images && product.images.length > 0 ? product.images : [product.mainImage || ""],
            colors: product.getColors() || [],
        }));

        res.render("search", {
            title: `Kết quả tìm kiếm cho "${searchName}"`,
            products: formattedProducts,
            searchQuery: searchName,
        });
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        res.status(500).render("errorpage", {
            title: "Lỗi",
            message: "Không thể thực hiện tìm kiếm. Vui lòng thử lại sau.",
        });
    }
});

module.exports = router;