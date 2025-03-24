const axios = require("axios");
const UserService = require("../../service/user.service");
const ProductService = require("../../service/productService");

module.exports.renderAdminPage = async (req, res) => {
  try {
    const users = await UserService.getAllUsers(req);
    const products = await ProductService.getAllProducts(req);
    res.render("dashboard", {
      layout: false,
      title: "Trang Quản Trị",
      headers: {
        Authorization: `Bearer ${req.token}`,
      },
      users: users.map((user) => user.getPublicInfo()),
      products: products.map((product) => ({
        id: product.productId,
        name: product.name,
        price: product.formatPrice(),
        stock: product.stock,
        isInStock: product.isInStock(),
      })),
    });
  } catch (error) {
    console.error("Lỗi khi tải trang dashboard:", error);
    res.status(500).render("errorpage", {
      title: "Lỗi",
      message: "Không thể tải trang quản trị. Vui lòng thử lại sau.",
    });
  }
};

module.exports.getAllUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền truy cập. Chỉ admin mới có thể xem danh sách user.",
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token không tồn tại",
      });
    }

    const response = await axios.get(`${process.env.API_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách user thành công",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách user",
      error: error.response ? error.response.data : error.message,
    });
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Bạn không có quyền truy cập. Chỉ admin mới có thể thực hiện.",
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token không tồn tại",
      });
    }

    const productId = req.params.id;
    const response = await axios.get(
      `${process.env.API_URL}/api/products/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: "Lấy thông tin sản phẩm thành công",
      data: response.data,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      status: false,
      message: "Không thể lấy thông tin sản phẩm",
      error: error.response ? error.response.data : error.message,
    });
  }
};

// Thêm sản phẩm mới
module.exports.createProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message:
          "Bạn không có quyền thêm sản phẩm. Chỉ admin mới có thể thực hiện.",
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token không tồn tại",
      });
    }

    const productData = req.body;
    const response = await axios.post(
      `${process.env.API_URL}/api/products`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(201).json({
      status: true,
      product_id: response.data.product_id,
      message: "Thêm sản phẩm thành công",
      data: response.data,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      status: false,
      message: "Không thể thêm sản phẩm",
      error: error.response ? error.response.data : error.message,
    });
  }
};

// Cập nhật sản phẩm
module.exports.updateProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message:
          "Bạn không có quyền cập nhật sản phẩm. Chỉ admin mới có thể thực hiện.",
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token không tồn tại",
      });
    }

    const productId = req.params.id;
    const productData = req.body;
    console.log(productData.data);
    const response = await axios.put(
      `${process.env.API_URL}/api/products/${productId}`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      status: true,
      message: "Cập nhật sản phẩm thành công",
      data: response.data.data,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      status: false,
      message: "Không thể cập nhật sản phẩm",
      error: error.response ? error.response.data : error.message,
    });
  }
};

// Xóa sản phẩm
module.exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message:
          "Bạn không có quyền xóa sản phẩm. Chỉ admin mới có thể thực hiện.",
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Token không tồn tại",
      });
    }

    const productId = req.params.id;
    await axios.delete(`${process.env.API_URL}/api/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      status: false,
      message: "Không thể xóa sản phẩm",
      error: error.response ? error.response.data : error.message,
    });
  }
};
