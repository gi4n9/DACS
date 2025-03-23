const express = require("express");
const router = express.Router();
const CategoryService = require("../service/categoryService");
const ProductService = require("../service/productService");

// Hàm đệ quy để tìm danh mục theo slug trong danh sách danh mục và các danh mục con
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

// Hàm để tìm danh mục cha theo parent_id
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

// Route cho trang bộ sưu tập chính
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

// Route cho trang bộ sưu tập theo danh mục (slug)
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;

    // Kiểm tra slug hợp lệ
    if (!slug || slug === "[" || !/^[a-z0-9-]+$/.test(slug)) {
      return res.status(404).render("errorpage", {
        title: "Không tìm thấy",
        message: "Danh mục không hợp lệ.",
      });
    }

    // Lấy danh sách tất cả danh mục
    const categories = await CategoryService.getAllCategories();

    // Tìm danh mục có slug tương ứng (bao gồm cả danh mục con)
    const category = findCategoryBySlug(categories, slug);

    if (!category) {
      return res.status(404).render("errorpage", {
        title: "Không tìm thấy",
        message: "Không tìm thấy danh mục này.",
      });
    }

    // Tìm danh mục cha (nếu có)
    let parentCategory = null;
    if (category.parent_id) {
      parentCategory = findParentCategory(categories, category.parent_id);
    }

    // Lấy sản phẩm theo danh mục
    const products = await ProductService.getProductsByCategory(
      category.category_id
    );

    // Kiểm tra products có phải là mảng không
    if (!Array.isArray(products)) {
      console.error("Dữ liệu sản phẩm không phải mảng:", products);
      throw new Error("Dữ liệu sản phẩm không hợp lệ");
    }

    // Chuyển đổi dữ liệu sản phẩm để phù hợp với template
    const formattedProducts = products.map((product) => {
      return {
        id: product.product_id || "unknown",
        name: product.name || "Không có tên",
        price: product.formatPrice() || "0 đ",
        oldPrice: product.formatOriginPrice() || null,
        discount: product.calculateDiscount() || null,
        images: product.images || [],
        colors: product.getColors() || [],
      };
    });

    // Tạo thông báo nếu không có sản phẩm
    const noProductsMessage =
      formattedProducts.length === 0
        ? "Hiện tại không có sản phẩm nào trong danh mục này."
        : null;

    // Tạo breadcrumbs
    const breadcrumbs = [{ name: "Trang chủ", url: "/" }];

    // Nếu có danh mục cha, thêm vào breadcrumbs
    if (parentCategory) {
      breadcrumbs.push({
        name: parentCategory.name,
        url: `/collection/${parentCategory.slug}`,
      });
    }

    // Thêm danh mục hiện tại vào breadcrumbs
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
