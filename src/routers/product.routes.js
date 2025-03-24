const express = require("express");
const router = express.Router();
const ProductService = require("../service/productService");
const CategoryService = require("../service/categoryService");

function findCategoryById(categories, categoryId) {
    for (const category of categories) {
        if (category.category_id.toString() === categoryId.toString()) {
            return category;
        }
        if (category.children && category.children.length > 0) {
            const found = findCategoryById(category.children, categoryId);
            if (found) return found;
        }
    }
    return null;
}

router.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        if (!productId || isNaN(productId)) {
            return res.status(404).render("errorpage", {
                title: "Không tìm thấy",
                message: "ID sản phẩm không hợp lệ."
            });
        }

        const product = await ProductService.getProductById(productId);

        if (!product) {
            return res.status(404).render("errorpage", {
                title: "Không tìm thấy",
                message: "Không tìm thấy sản phẩm này."
            });
        }

        if (typeof product.formatPrice !== "function") {
            console.error("Product không phải instance của Product class:", product);
            throw new Error("Dữ liệu sản phẩm không hợp lệ");
        }

        const categories = await CategoryService.getAllCategories();
        const category = product.category_id ? findCategoryById(categories, product.category_id) : null;

        const colors = product.getColors() || [];
        const sizes = [...new Set(product.variants.map(variant => variant.size_name))].filter(size => size);

        const formattedProduct = {
            id: product.product_id || "unknown",
            name: product.name || "Không có tên",
            price: product.formatPrice() || "0 đ",
            oldPrice: product.formatOriginPrice() || null,
            discount: product.calculateDiscount() || null,
            description: product.description || "Không có mô tả",
            shipping: "Miễn phí - Giao chậm 1-2 ngày",
            images: product.images || [],
            colors: colors,
            sizes: sizes,
            variants: product.variants || [],
            category: category || null
        };

        console.log("Sản phẩm:", formattedProduct.variants.length); // Kiểm tra dữ liệu variants

        let recommendedProducts = [];
        if (product.category_id) {
            const categoryProducts = await ProductService.getProductsByCategory(product.category_id, 4);
            recommendedProducts = categoryProducts
                .filter(p => p.product_id !== product.product_id)
                .slice(0, 4)
                .map(p => ({
                    id: p.product_id || "unknown",
                    name: p.name || "Không có tên",
                    price: p.formatPrice() || "0 đ",
                    oldPrice: p.formatOriginPrice() || null,
                    discount: p.calculateDiscount() || null,
                    images: p.images || [],
                    colors: p.getColors() || [],
                }));
        }

        const breadcrumbs = [
            { name: "Trang chủ", url: "/" },
            { name: category?.name || "Sản phẩm", url: category ? `/collection/${category.slug}` : "/collection" },
            { name: product.name, url: null }
        ];

        res.render("product", {
            title: formattedProduct.name,
            product: formattedProduct,
            recommendedProducts: recommendedProducts,
            breadcrumbs: breadcrumbs
        });
    } catch (error) {
        console.error("Lỗi khi tải trang chi tiết sản phẩm:", error);
        res.status(500).render("errorpage", {
            title: "Lỗi",
            message: "Không thể tải trang chi tiết sản phẩm. Vui lòng thử lại sau."
        });
    }
});

module.exports = router;