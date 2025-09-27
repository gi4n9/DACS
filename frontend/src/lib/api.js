import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000/api", // đổi nếu backend ở domain khác
})

// Lấy sản phẩm theo category (có phân trang)
export const getProductsByCategory = async (catId, page = 1, limit = 8) => {
    const res = await api.get(`/products/category/${catId}?page=${page}&limit=${limit}`)
    return res.data.data
}

// Filter theo size
export const getProductsBySize = async (size, page = 1, limit = 8) => {
    const res = await api.get(`/products/search/size?size=${size}&page=${page}&limit=${limit}`)
    return res.data.data
}

// Filter theo màu
export const getProductsByColor = async (color, page = 1, limit = 8) => {
    const res = await api.get(`/products/search/color?color=${color}&page=${page}&limit=${limit}`)
    return res.data.data
}

// Filter theo khoảng giá
export const getProductsByPrice = async (min, max, page = 1, limit = 8) => {
    const res = await api.get(`/products/search/price?min=${min}&max=${max}&page=${page}&limit=${limit}`)
    return res.data.data
}

// Lấy chi tiết sản phẩm theo slug
export const getProductBySlug = async (slug) => {
    const res = await api.get(`/products/slug/${slug}`)
    return res.data.data
}

// Lấy sản phẩm liên quan (cùng category)
export const getRelatedProducts = async (categoryId, page = 1, limit = 4) => {
    const res = await api.get(`/products/category/${categoryId}?page=${page}&limit=${limit}`)
    return res.data.data
}