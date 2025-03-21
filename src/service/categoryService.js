const axios = require("axios");
const Category = require("../app/models/categoryModel");

class CategoryService {
    static async getAllCategories() {
        try {
            const response = await axios.get(
                "https://fshop.nghienshopping.online/api/cat/getall"
            );
            const apiData = response.data;
            return Category.fromApiData(apiData);
        } catch (error) {
            throw new Error("Không thể lấy dữ liệu danh mục từ API: " + error.message);
        }
    }

    static async getCategoryById(id) {
        try {
            const response = await axios.get(
                `https://fshop.nghienshopping.online/api/cat/getid/${id}`
            );
            const apiData = response.data;
            return Category.fromApiData(apiData);
        } catch (error) {
            throw new Error(`Không thể lấy danh mục có ID ${id} từ API: ` + error.message);
        }
    }
}

module.exports = CategoryService;