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

  static async getProductById(id) {
    try {
      const response = await axios.get(
        `${process.env.API_URL}/api/products/${id}`
      );
      const apiData = response.data;
      if (!apiData || typeof apiData !== "object" || !apiData.data.product) {
        throw new Error(`Dữ liệu sản phẩm có ID ${id} không hợp lệ`);
      }
      const product = new Product(apiData.data.product);
      console.log("Product variants:", product.variants); // Kiểm tra variants
      return product;
    } catch (error) {
      throw new Error(
        `Không thể lấy sản phẩm có ID ${id} từ API: ` + error.message
      );
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

  // Tìm kiếm sản phẩm theo tên
  static async searchProductsByName(name) {
    try {
      const response = await axios.get(
        `${process.env.API_URL}/api/products/search/name`,
        {
          params: { name: name },
        }
      );

      // Kiểm tra response từ API
      if (
        response.data &&
        response.data.status === true &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data.map((item) => {
          // Chuẩn bị dữ liệu cho constructor
          const productData = {
            product_id: item.product_id,
            category_id: item.category_id,
            brand: item.brand_id, // Giả sử brand được lưu như brand_id
            name: item.name,
            price: item.price,
            origin_price: item.origin_price,
            discount: item.discount,
            stock: item.stock,
            description: item.description || "",
            image: item.image,
            images: item.images || JSON.stringify([item.image]),
            created_at: item.created_at,
            updated_at: item.updated_at,
            variants: item.variants || [], // Thêm variants nếu có
          };

          return new Product(productData);
        });
      } else {
        console.warn("Unexpected API response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Search error details:", {
        message: error.message,
        response: error.response ? error.response.data : "No response",
        stack: error.stack,
      });
      throw new Error(`Không thể tìm kiếm sản phẩm: ${error.message}`);
    }
  }
}

module.exports = ProductService;
