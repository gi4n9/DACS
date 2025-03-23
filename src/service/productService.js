const axios = require("axios");
const Product = require("../app/models/productModel");

class ProductService {
  static async getAllProducts() {
    try {
      const response = await axios.get(
        "https://fshop.nghienshopping.online/api/products/getall"
      );
      const apiData = response.data;
      return Product.fromApiData(apiData);
    } catch (error) {
      throw new Error(
        "Không thể lấy dữ liệu sản phẩm từ API: " + error.message
      );
    }
  }

  static async getProductById(id) {
    try {
      const response = await axios.get(
        `https://fshop.nghienshopping.online/api/products/getid/${id}`
      );
      const apiData = response.data;
      // API trả về một object chứa "category" và "product"
      if (!apiData || typeof apiData !== "object" || !apiData.product) {
        throw new Error(`Dữ liệu sản phẩm có ID ${id} không hợp lệ`);
      }
      // Tạo instance của Product từ apiData.product
      return new Product(apiData.product);
    } catch (error) {
      throw new Error(
        `Không thể lấy sản phẩm có ID ${id} từ API: ` + error.message
      );
    }
  }

  static async getProductsByCategory(categoryId, limit = 10, page = 1) {
    try {
      const response = await axios.get(
        `https://fshop.nghienshopping.online/api/products/getcat/${categoryId}?page=${page}&limit=${limit}`
      );
      const apiData = response.data;
      if (!apiData || typeof apiData !== "object") {
        console.warn(
          `API trả về dữ liệu không hợp lệ cho danh mục ${categoryId}:`,
          apiData
        );
        return [];
      }
      if (apiData.products && Array.isArray(apiData.products)) {
        return Product.fromApiData(apiData.products);
      }
      return Product.fromApiData(apiData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      throw new Error(
        `Không thể lấy sản phẩm theo danh mục ID ${categoryId}: ` +
          error.message
      );
    }
  }
}

module.exports = ProductService;
