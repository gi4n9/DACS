import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000/api", // đổi thành domain backend của bạn
})

// theo category
export const getProductsByCategory = async (catId) => {
    const res = await api.get(`/products/category/${catId}`)
    return res.data.data.products
}

// lọc theo từng tiêu chí
export const getProductsByColor = async (color) => {
    const res = await api.get(`/products/search/color?color=${color}`)
    return res.data.data
}

export const getProductsBySize = async (size) => {
    const res = await api.get(`/products/search/size?size=${size}`)
    return res.data.data
}

export const getProductsByPrice = async (min, max) => {
    const res = await api.get(`/products/search/price?min=${min}&max=${max}`)
    return res.data.data
}

// multi-filter (frontend xử lý)
export const filterProducts = async ({ size, color, min, max }) => {
    // Nếu chỉ có 1 filter => gọi API backend trực tiếp
    if (size && !color && !min && !max) return getProductsBySize(size)
    if (color && !size && !min && !max) return getProductsByColor(color)
    if ((min || max) && !size && !color) return getProductsByPrice(min, max)

    // Nếu nhiều filter => gọi tất cả và lấy giao (intersect)
    let data = await getProductsByCategory(2) // ví dụ chỉ trong category áo thun nam
    if (size) data = data.filter((p) => p.variants?.some(v => v.size_name.toLowerCase() === size))
    if (color) data = data.filter((p) => p.variants?.some(v => v.color_name.toLowerCase() === color))
    if (min || max) data = data.filter((p) => p.price >= (min || 0) && p.price <= (max || 999999999))
    return data
}
