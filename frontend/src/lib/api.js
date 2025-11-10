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
  filters = {} // { rating, hasImages }
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
      // (Backend của bạn có thể chưa hỗ trợ 'hasImages', nhưng FE sẽ gửi nó)
      params.append("hasImages", "true");
    }

    const queryString = params.toString();

    // 2. Gọi API
    const res = await api.get(`/reviews/product/${productId}?${queryString}`);

    // 3. Trả về data (API response: { status: true, data: { items: [...], pagination: {...} } })
    return res.data;
  } catch (err) {
    console.error("Lỗi getProductReviews:", err);
    return { status: false, data: { items: [], pagination: {} } };
  }
};

export const getReviewableProducts = async (token) => {
  try {
    const res = await api.get("/users/reviewable-products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { status: true, data: [...] }
  } catch (err) {
    console.error("Lỗi getReviewableProducts:", err);
    return { status: false, data: [] };
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

export const getUserOrders = async (token) => {
  try {
    // Gọi API GET /orders (theo response mẫu bạn cung cấp)
    const res = await api.get("/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // { status: true, data: [...] }
  } catch (err) {
    console.error("Lỗi getUserOrders:", err);
    return { status: false, data: [] };
  }
};
