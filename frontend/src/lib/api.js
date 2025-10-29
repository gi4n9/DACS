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
  sort = null
) => {
  const query = new URLSearchParams({
    page,
    limit,
    ...(filters.size && { size: filters.size }),
    ...(filters.color && { color: filters.color }),
    ...(filters.minPrice && { min_price: filters.minPrice }),
    ...(filters.maxPrice && { max_price: filters.maxPrice }),
    ...(sort && { sort }),
  }).toString();
  try {
    // Gọi API bằng slug
    const res = await api.get(`/products/category/${slug}?${query}`);
    console.log("getProductsByCategorySlug response:", res.data); // Debug

    // Trả về toàn bộ response data
    // (Response mẫu của bạn là: { status: true, data: { category, products, pagination } })
    return res.data;
  } catch (err) {
    console.error(
      "Lỗi getProductsByCategorySlug:",
      err,
      "Response:",
      err.response?.data
    );
    // Trả về cấu trúc lỗi tương tự
    return {
      status: false,
      data: { products: [], category: [], pagination: {} },
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

// Thêm hàm lấy đơn hàng của user
export const getMyOrders = async (token) => {
  try {
    const res = await api.get("/orders/my", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Chuẩn hoá nhiều dạng response có thể nhận được từ backend
    const payload = res.data || {};
    const orders =
      payload?.data?.orders ||
      payload?.orders ||
      payload?.data ||
      payload ||
      [];
    return Array.isArray(orders) ? orders : [];
  } catch (err) {
    console.error("getMyOrders error:", err?.response?.data || err.message);
    throw err;
  }
};

// Thêm hàm gửi lại email xác nhận đơn
export const resendOrderConfirmation = async (orderId, token) => {
  try {
    const res = await api.post(
      `/orders/${orderId}/resend-confirmation`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return res.data;
  } catch (err) {
    console.error("resendOrderConfirmation error:", err?.response?.data || err.message);
    throw err;
  }
};
