import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL + "/api",
});

// Danh mục
export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await api.get(`/categories/${id}`);
  return res.data;
};

export const getCategoryBySlug = async (slug) => {
  const res = await api.get(`/products/category/${slug}`);
  return res.data;
};

export const getProductsByCategorySlug = async (
  slug,
  page = 1,
  limit = 12,
  filters = {},
  sort = null // sort có thể là "price_asc", "price_desc", "discount", v.v.
) => {
  // 1. Xây dựng các tham số
  const params = new URLSearchParams({
    page,
    limit,
    ...(filters.size && { size: filters.size }),
    ...(filters.color && { color: filters.color }),
    ...(filters.minPrice && { min_price: filters.minPrice }),
    ...(filters.maxPrice && { max_price: filters.maxPrice }),
    ...(filters.minRating && { minRating: filters.minRating }), // <-- THÊM MỚI
  });

  // 2. Xử lý logic sort (theo API mới)
  if (sort) {
    if (sort === "price_asc") {
      params.append("sort", "price");
      params.append("order", "asc");
    } else if (sort === "price_desc") {
      params.append("sort", "price");
      params.append("order", "desc");
    } else if (sort === "discount") {
      // Ví dụ từ API của bạn
      params.append("sort", "discount");
      params.append("order", "asc");
    } else {
      // (Bạn có thể thêm "newest", "bestseller" nếu backend hỗ trợ)
      params.append("sort", sort);
    }
  }

  const queryString = params.toString();

  try {
    // 3. Gọi API
    const res = await api.get(`/products/category/${slug}?${queryString}`);
    console.log("getProductsByCategorySlug response:", res.data);

    // 4. Trả về toàn bộ response (Code này đã đúng)
    return res.data;
  } catch (err) {
    console.error(
      "Lỗi getProductsByCategorySlug:",
      err,
      "Response:",
      err.response?.data
    );
    return {
      status: false,
      data: { products: [], category: [] },
      pagination: { totalPages: 1, page: 1 },
    };
  }
};

export const getTotalProductsByCategoryId = async (
  categoryId,
  filters = {}
) => {
  try {
    // Tạo query string cho các bộ lọc
    const query = new URLSearchParams({
      ...(filters.size && { size: filters.size }),
      ...(filters.color && { color: filters.color }),
      ...(filters.minPrice && { min_price: filters.minPrice }),
      ...(filters.maxPrice && { max_price: filters.maxPrice }),
    }).toString();

    // Gọi API để lấy toàn bộ sản phẩm trong danh mục (backend chưa hỗ trợ total)
    const res = await api.get(`/products/category/${categoryId}?${query}`);

    // Đảm bảo dữ liệu hợp lệ
    if (!res.data?.status || !res.data?.data?.products) {
      console.warn(
        "getTotalProductsByCategoryId: API trả về không hợp lệ",
        res.data
      );
      return 0;
    }

    const products = Array.isArray(res.data.data.products)
      ? res.data.data.products
      : [];

    // Đếm tổng số sản phẩm hợp lệ (có id và giá)
    const validProducts = products.filter(
      (p) => p && p.product_id && Number.isFinite(p.price)
    );

    return validProducts.length || 0;
  } catch (err) {
    console.error("Lỗi getTotalProductsByCategoryId:", err);
    return 0;
  }
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/id/${id}`);
  return res.data;
};

export const getRelatedProducts = async (categoryId, page = 1, limit = 4) => {
  try {
    const query = new URLSearchParams({ page, limit }).toString();
    const res = await api.get(`/products/category/${categoryId}?${query}`);
    console.log("getRelatedProducts response:", res.data); // Debug
    const products = Array.isArray(res.data.data?.products)
      ? res.data.data.products
      : [];
    const validProducts = products.filter(
      (p) => p && p.product_id && Number.isFinite(p.price)
    );
    if (products.length !== validProducts.length) {
      console.warn(
        "Filtered out invalid products in getRelatedProducts:",
        products.filter((p) => !p || !p.product_id || !Number.isFinite(p.price))
      );
    }
    return {
      data: validProducts,
      total: res.data.data?.products?.length || 0,
    };
  } catch (err) {
    console.error(
      "Lỗi getRelatedProducts:",
      err,
      "Response:",
      err.response?.data
    );
    return { data: [], total: 0 };
  }
};

export const searchProducts = async (
  queryTerm, // (q) Tên danh mục (ví dụ: "Áo thun nam")
  page = 1,
  limit = 12,
  filters = {}, // { size, color, minPrice, maxPrice }
  sort = null //
) => {
  // 1. Xây dựng các tham số
  const params = new URLSearchParams({
    q: queryTerm,
    page,
    limit,
    inStock: "true", // Gửi "true" theo yêu cầu của bạn
  });

  // 2. Thêm các bộ lọc nếu chúng tồn tại
  if (filters.minPrice) {
    params.append("min", filters.minPrice);
  }
  if (filters.maxPrice) {
    params.append("max", filters.maxPrice);
  }
  if (filters.size) {
    params.append("size", filters.size);
  }
  if (filters.color) {
    params.append("color", filters.color);
  }
  if (sort) {
    params.append("sort", sort);
  }

  const queryString = params.toString();

  try {
    // 3. Gọi API
    const res = await api.get(`/products/search-advanced?${queryString}`);
    console.log("data search", res.data);
    // 4. Trả về toàn bộ data (để CategoryPage xử lý)
    // (Giả định res.data có dạng { status, data: {...}, pagination: {...} })
    return res.data;
  } catch (err) {
    console.error(
      "Lỗi khi gọi searchProducts:",
      err,
      "Response:",
      err.response?.data
    );
    // Trả về cấu trúc lỗi để tránh crash
    return {
      status: false,
      data: { products: [] },
      pagination: { totalPages: 1, page: 1 },
    };
  }
};

export const getProductReviews = async (
  productId,
  page = 1,
  limit = 10,
  sort = "-createdAt",
  filters = {} // { rating, hasImages, hasFeedback }
) => {
  try {
    // 1. Xây dựng tham số
    const params = new URLSearchParams({
      page,
      limit,
      sort,
    });

    // Thêm các bộ lọc nếu có
    if (filters.rating) {
      params.append("rating", filters.rating);
    }
    if (filters.hasImages) {
      params.append("hasImages", "true");
    }

    // --- SỬA LỖI: THÊM BỘ LỌC hasFeedback ---
    if (filters.hasFeedback) {
      params.append("hasFeedback", "true");
    }
    // --- KẾT THÚC SỬA LỖI ---

    const queryString = params.toString();

    // 2. Gọi API
    const res = await api.get(`/reviews/product/${productId}?${queryString}`);

    // 3. Trả về data
    return res.data;
  } catch (err) {
    console.error("Lỗi getProductReviews:", err);
    return { status: false, data: { items: [], pagination: {} } };
  }
};

export const submitReview = async (reviewData, files, token) => {
  // reviewData = { productId, rating, content }
  // files = mảng các đối tượng File

  try {
    // 1. Luôn tạo FormData
    const formData = new FormData();

    // 2. Thêm các trường text (giống hệt Postman)
    formData.append("productId", reviewData.productId);
    formData.append("rating", reviewData.rating); // Postman gửi rating là Text
    formData.append("content", reviewData.content);

    // (Nếu backend của bạn cần 'orderItemId', hãy thêm nó vào đây)
    // formData.append('orderItemId', reviewData.orderItemId);

    // 3. Thêm file (nếu có)
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        // "images" là key trong Postman
        formData.append("images", files[i]);
      }
    }

    // 4. Gửi request
    const res = await api.post("/reviews", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // Quan trọng
      },
    });

    // Trả về response thành công
    return res.data;
  } catch (err) {
    console.error("Lỗi submitReview:", err);
    return {
      status: false,
      message: err.response?.data?.message || "Gửi thất bại",
    };
  }
};

export const getUserOrders = async (token, page = 1, limit = 10) => {
  try {
    // 1. Xây dựng tham số query
    const params = new URLSearchParams({
      page,
      limit,
    });
    const queryString = params.toString();

    // 2. Gọi API GET /orders (với query string)
    const res = await api.get(`/orders?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 3. Trả về data (API response: { status: true, data: { orders: [...], pagination: {...} } })
    return res.data;
  } catch (err) {
    console.error("Lỗi getUserOrders:", err);
    return {
      status: false,
      data: { orders: [], pagination: { page: 1, pages: 1 } },
    };
  }
};

export const getWishlistProducts = async (token) => {
  try {
    // API response: { status, data: { products: [...] } }
    const res = await api.get("/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi getWishlistProducts:", err);
    return { status: false, data: { products: [] } };
  }
};

export const getUserAddresses = async (token) => {
  try {
    // API response: { status, data: { addresses: [...] } }
    const res = await api.get("/users/addresses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Trả về toàn bộ response data
  } catch (err) {
    console.error("Lỗi getUserAddresses:", err);
    // Trả về cấu trúc lỗi để Cart.jsx có thể xử lý
    return { status: false, data: { addresses: [] }, message: err.message };
  }
};

export const addUserAddress = async (addressData, token) => {
  // addressData là object chứa { fullName, phone, street, ... }
  try {
    const res = await api.post("/users/addresses", addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // axios tự động thêm 'Content-Type: application/json'
        // khi data là một object
      },
    });

    // Trả về response thành công (vd: { status: true, data: { ... } })
    return res.data;
  } catch (err) {
    console.error("Lỗi addUserAddress:", err.response?.data || err.message);
    // Trả về thông báo lỗi từ server nếu có
    return {
      status: false,
      message: err.response?.data?.message || "Thêm địa chỉ thất bại",
    };
  }
};

export const updateUserAddress = async (addressId, addressData, token) => {
  try {
    const res = await api.put(`/users/addresses/${addressId}`, addressData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Trả về response thành công (vd: { status: true, data: { address: {...} } })
    return res.data;
  } catch (err) {
    console.error("Lỗi updateUserAddress:", err.response?.data || err.message);
    return {
      status: false,
      message: err.response?.data?.message || "Cập nhật địa chỉ thất bại",
    };
  }
};

export const deleteUserAddress = async (addressId, token) => {
  try {
    const res = await api.delete(`/users/addresses/${addressId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Thường trả về { status: true, message: "Xóa thành công" }
    return res.data;
  } catch (err) {
    console.error("Lỗi deleteUserAddress:", err.response?.data || err.message);
    return {
      status: false,
      message: err.response?.data?.message || "Xóa địa chỉ thất bại",
    };
  }
};

export const setDefaultUserAddress = async (addressId, token) => {
  try {
    // Gửi null làm body nếu không có data
    const res = await api.patch(`/users/addresses/${addressId}/default`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Thường trả về { status: true, message: "Đặt mặc định thành công" }
    return res.data;
  } catch (err) {
    console.error(
      "Lỗi setDefaultUserAddress:",
      err.response?.data || err.message
    );
    return {
      status: false,
      message: err.response?.data?.message || "Đặt mặc định thất bại",
    };
  }
};

export const getRecommendedProducts = async (token, limit = 10) => {
  try {
    const res = await api.get(`/products/recommendations?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // API response: { status: true, data: [...] }
    // 'data' ở đây là mảng sản phẩm
    if (res.data.status === true && Array.isArray(res.data.data)) {
      return { status: true, data: res.data.data };
    } else {
      // Trả về cấu trúc lỗi
      return { status: false, data: [] };
    }
  } catch (err) {
    console.error(
      "Lỗi getRecommendedProducts:",
      err.response?.data || err.message
    );
    return {
      status: false,
      data: [],
      message: err.response?.data?.message || "Lỗi lấy sản phẩm gợi ý",
    };
  }
};
