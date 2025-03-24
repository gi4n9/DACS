const axios = require("axios");
const Product = require("../app/models/productModel");


class ProductService {
  static async getAllProducts() {
    try {
      const response = await axios.get(
        `${process.env.API_URL}/api/products?page=1&limit=20`
      );
      const apiData = response.data;
      if (Array.isArray(apiData)) {
        return apiData.map((item) => new Product(item));
      }
      if (apiData.product && Array.isArray(apiData.product)) {
        return apiData.product.map((item) => new Product(item));
      }
      return [new Product(apiData)];
    } catch (error) {
      throw new Error(
        "Không thể lấy dữ liệu sản phẩm từ API: " + error.message
      );
    }
  }

  static async getProductById(id) {
    try {
      const response = await axios.get(`${process.env.API_URL}/api/products/${id}`);
      const apiData = response.data;
      if (!apiData || typeof apiData !== "object" || !apiData.data.product) {
        throw new Error(`Dữ liệu sản phẩm có ID ${id} không hợp lệ`);
      }
      const product = new Product(apiData.data.product);
      console.log("Product variants:", product.variants); // Kiểm tra variants
      return product;
    } catch (error) {
      throw new Error(`Không thể lấy sản phẩm có ID ${id} từ API: ` + error.message);
    }
  }

  static async getProductsByCategory(categoryId, limit = 20, page = 1) {
    try {
      const response = await axios.get(
        `${process.env.API_URL}/api/products/category/${categoryId}`,
        {
          params: {
            limit: limit,
            page: page,
          },
        }
      );

      const apiData = response.data;
      console.log(apiData);

      // Kiểm tra dữ liệu trả về từ API
      if (!apiData || typeof apiData !== "object") {
        console.warn(
          `API trả về dữ liệu không hợp lệ cho danh mục ${categoryId}:`,
          apiData
        );
        return [];
      }

      // Nếu API trả về object chứa mảng products
      if (apiData.data.products && Array.isArray(apiData.data.products)) {
        return apiData.data.products.map((item) => new Product(item));
      }

      // Nếu API trả về trực tiếp mảng sản phẩm
      if (Array.isArray(apiData)) {
        return apiData.map((item) => new Product(item));
      }

      // Nếu API trả về một object sản phẩm đơn
      return [new Product(apiData)];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return []; // Trả về mảng rỗng nếu không tìm thấy danh mục
      }
      throw new Error(
        `Không thể lấy sản phẩm theo danh mục ID ${categoryId}: ` +
          error.message
      );
    }
  }

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
}

module.exports = ProductService;