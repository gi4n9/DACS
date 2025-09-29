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

export const getProductsByCategoryId = async (id, page = 1, limit = 12) => {
    const res = await api.get(`/products/category/${id}?page=${page}&limit=${limit}`);
    return res.data;
};

export const getProductById = async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
};

// Lấy sản phẩm liên quan theo category
export const getRelatedProducts = async (categoryId, page = 1, limit = 4) => {
    const res = await api.get(`/products/category/${categoryId}?page=${page}&limit=${limit}`);
    return res.data;
};

