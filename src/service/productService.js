// service/productService.js
const axios = require("axios");
const Product = require("../app/models/productModel");
require("dotenv").config();

class ProductService {
  // Các phương thức hiện có giữ nguyên...

  // Thêm sản phẩm mới
  static async createProduct(productData, token) {
    try {
      const response = await axios.post(
        `${process.env.API_URL}/api/products`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiData = response.data;
      return new Product(apiData.data.product || apiData);
    } catch (error) {
      throw new Error("Không thể thêm sản phẩm: " + error.message);
    }
  }

  // Cập nhật sản phẩm
  static async updateProduct(id, productData, token) {
    try {
      const response = await axios.put(
        `${process.env.API_URL}/api/products/${id}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiData = response.data;
      return new Product(apiData.data.product || apiData);
    } catch (error) {
      throw new Error(`Không thể cập nhật sản phẩm ID ${id}: ` + error.message);
    }
  }

  // Xóa sản phẩm
  static async deleteProduct(id, token) {
    try {
      await axios.delete(`${process.env.API_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { success: true, message: `Đã xóa sản phẩm ID ${id}` };
    } catch (error) {
      throw new Error(`Không thể xóa sản phẩm ID ${id}: ` + error.message);
    }
  }

  // Phương thức hiện có: Lấy tất cả sản phẩm
  static async getAllProducts() {
    try {
      const response = await axios.get(
        `${process.env.API_URL}/api/products?page=1&limit=1000`
      );
      const apiData = response.data;
      if (Array.isArray(apiData)) {
        return apiData.map((item) => new Product(item));
      }
      if (apiData.data && Array.isArray(apiData.data)) {
        return apiData.data.map((item) => new Product(item));
      }
      return [new Product(apiData)];
    } catch (error) {
      throw new Error(
        "Không thể lấy dữ liệu sản phẩm từ API: " + error.message
      );
    }
  }

  // Các phương thức khác giữ nguyên...
}

module.exports = ProductService;
