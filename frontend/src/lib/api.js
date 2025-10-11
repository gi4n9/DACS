import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL + "/api",
});

// Danh mục
export const getCategories = async () => {
  const res = await api.get("/cat");
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await api.get(`/cat/${id}`);
  return res.data;
};

export const getCategoryBySlug = async (slug) => {
  const res = await api.get(`/cat/slug/${slug}`);
  return res.data;
};

export const getProductsByCategoryId = async (
  id,
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
    const res = await api.get(`/products/category/${id}?${query}`);
    console.log("getProductsByCategoryId response:", res.data); // Debug
    const products = Array.isArray(res.data.data?.products)
      ? res.data.data.products
      : [];
    // Lọc sản phẩm hợp lệ
    const validProducts = products.filter(
      (p) => p && p.product_id && Number.isFinite(p.price)
    );
    if (products.length !== validProducts.length) {
      console.warn(
        "Filtered out invalid products:",
        products.filter((p) => !p || !p.product_id || !Number.isFinite(p.price))
      );
    }
    return {
      data: validProducts,
      total: res.data.data?.products?.length || 0,
    };
  } catch (err) {
    console.error(
      "Lỗi getProductsByCategoryId:",
      err,
      "Response:",
      err.response?.data
    );
    return { data: [], total: 0 };
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
  const res = await api.get(`/products/${id}`);
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
