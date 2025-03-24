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

  getColorCode(colorName) {
    const colorMap = {
      'TRẮNG': '#ffffff',
      'ĐEN': '#000000',
      'CAM': '#ff5733',
      'XANH DƯƠNG': '#0d47a1',
      'NÂU': '#D2B48C',
      'XÁM NHẠT': '#D3D3D3',
      'BE': '#e8e0d3',
      'XANH NAVY': '#232a38',
      'XANH NHẠT': '#ADD8E6',
      'KEM': '#e8e6cf',
      'XÁM': '#d4d4d4',
      'ĐỎ': '#ff0000',
      'NÂU SÂU': '#4A2C2A',
      'XANH MINT': '#dadbd5',
      'XANH RÊU': '#334134',
      'XANH TÍM': '#b0b6c3',
      'XANH ĐẬM': '#174283',
      'XANH BIỂN': '#3c4353',
      'XANH PASTEL': '#cbdde9',
      'XÁM MELANGE': '#929092',
      'ĐỎ ZIFANDEL': '#6c3034',
      'XÁM CASTLEROCK': '#757576',
      'NÂU CAPPUCCINO': '#7e523b',
      'XANH FOREST': '#228B22',
      'HỒNG': '#FF69B4',
      'BE 220GSM': '#F5F5DC',
      'XANH DEEP JUNGLE': '#28433f'
    };
    return colorMap[colorName.toUpperCase()] || '#000000';
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
      colors.set(variant.colorId, {
        name: variant.colorName,
        code: this.getColorCode(variant.colorName)
      });
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
