// productModel.js
class ProductVariant {
  constructor(data) {
    this.variantId = data.variant_id;
    this.colorId = data.color_id;
    this.colorName = data.color_name;
    this.sizeId = data.size_id;
    this.sizeName = data.size_name;
    this.price = data.price;
    this.originPrice = data.origin_price;
    this.discount = data.discount;
    this.stock = data.stock;
    this.image = data.variant_image;
  }

  getDiscountedPrice() {
    return this.price;
  }

  isInStock() {
    return this.stock > 0;
  }
}

class Product {
  constructor(data) {
    this.productId = data.product_id;
    this.categoryId = data.category_id;
    this.brand = data.brand;
    this.name = data.name;
    this.price = data.price;
    this.originPrice = data.origin_price;
    this.discount = data.discount;
    this.stock = data.stock;
    this.description = data.description || "";
    this.mainImage = data.image;
    this.images = this.parseImages(data.images);
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
    this.variants = this.parseVariants(data.variants);
  }

  parseImages(imagesString) {
    try {
      return JSON.parse(imagesString);
    } catch (e) {
      console.error("Error parsing images:", e);
      return [this.mainImage];
    }
  }

  parseVariants(variantsData) {
    return variantsData.map((variant) => new ProductVariant(variant));
  }

  // Định dạng giá thành chuỗi (ví dụ: "299,000 đ")
  formatPrice() {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(this.price)
      .replace("₫", "đ");
  }

  // Định dạng giá gốc
  formatOriginPrice() {
    if (!this.originPrice || this.originPrice === this.price) return null;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(this.originPrice)
      .replace("₫", "đ");
  }

  // Tính phần trăm giảm giá
  calculateDiscount() {
    if (!this.discount || this.discount === 0) return null;
    return `${this.discount}%`;
  }

  // Lấy danh sách màu sắc
  getColors() {
    const colors = new Map();
    this.variants.forEach((variant) => {
      colors.set(variant.colorId, variant.colorName);
    });
    return Array.from(colors.values());
  }

  getAvailableColors() {
    const colors = new Map();
    this.variants.forEach((variant) => {
      colors.set(variant.colorId, variant.colorName);
    });
    return Array.from(colors.entries()).map(([id, name]) => ({ id, name }));
  }

  getSizesByColor(colorId) {
    return this.variants
      .filter((variant) => variant.colorId === colorId)
      .map((variant) => ({
        id: variant.sizeId,
        name: variant.sizeName,
        stock: variant.stock,
      }));
  }

  getVariant(colorId, sizeId) {
    return this.variants.find(
      (v) => v.colorId === colorId && v.sizeId === sizeId
    );
  }

  isInStock() {
    return this.variants.some((variant) => variant.isInStock());
  }
}

module.exports = Product;
