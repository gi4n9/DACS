const express = require("express");
const router = express.Router();
const CategoryService = require("../service/categoryService");
const ProductService = require("../service/productService");

function findCategoryBySlug(categories, slug) {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return null;
}

function findParentCategory(categories, parentId) {
  for (const category of categories) {
    if (category.category_id.toString() === parentId.toString()) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findParentCategory(category.children, parentId);
      if (found) return found;
    }
  }
  return null;
}

router.get("/", async (req, res) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.render("collection", {
      title: "Bộ sưu tập",
      categories: categories,
    });
  } catch (error) {
    console.error("Lỗi khi tải trang bộ sưu tập:", error);
    res.status(500).render("errorpage", {
      title: "Lỗi",
      message: "Không thể tải trang bộ sưu tập. Vui lòng thử lại sau.",
    });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    if (!slug || slug === "[" || !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(404).render("errorpage", {
        title: "Không tìm thấy",
        message: "Danh mục không hợp lệ.",
      });
    }

    const categories = await CategoryService.getAllCategories();
    const category = findCategoryBySlug(categories, slug);

    if (!category) {
      return res.status(404).render("errorpage", {
        title: "Không tìm thấy",
        message: "Không tìm thấy danh mục này.",
      });
    }

    let parentCategory = null;
    if (category.parent_id) {
      parentCategory = findParentCategory(categories, category.parent_id);
    }

    const products = await ProductService.getProductsByCategory(
      category.category_id
    );

    if (!Array.isArray(products)) {
      console.error("Dữ liệu sản phẩm không phải mảng:", products);
      throw new Error("Dữ liệu sản phẩm không hợp lệ");
    }

    const formattedProducts = products.map((product) => {
      return {
        id: product.productId || "unknown",
        name: product.name || "Không có tên",
        price: product.formatPrice() || "0 đ",
        oldPrice: product.formatOriginPrice() || null,
        discount: product.calculateDiscount() || null,
        images: product.images || [],
        colors: product.getColors() || [],
      };
    });

    const noProductsMessage =
      formattedProducts.length === 0
        ? "Hiện tại không có sản phẩm nào trong danh mục này."
        : null;

    const breadcrumbs = [{ name: "Trang chủ", url: "/" }];
    if (parentCategory) {
      breadcrumbs.push({
        name: parentCategory.name,
        url: `/collection/${parentCategory.slug}`,
      });
    }
    breadcrumbs.push({
      name: category.name,
      url: null,
    });

    res.render("collection-id", {
      title: category.name,
      category: category,
      products: formattedProducts,
      noProductsMessage: noProductsMessage,
      breadcrumbs: breadcrumbs,
    });
  } catch (error) {
    console.error("Lỗi khi tải trang bộ sưu tập theo danh mục:", error);
    res.status(500).render("errorpage", {
      title: "Lỗi",
      message: "Không thể tải trang bộ sưu tập. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
