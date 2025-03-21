class Product {
    constructor(data) {
        console.log("Dữ liệu API trả về:", data);
        this.product_id = data.product_id;
        this.category_id = data.category_id;
        this.brand = data.brand;
        this.name = data.name;
        this.price = data.price || 0;
        this.origin_price = data.origin_price || 0;
        this.discount = data.discount || 0;
        this.stock = data.stock || 0;
        this.description = data.description || "";
        this.image = data.image || "";
        this.images = this.parseImages(data.images);
        this.variants = data.variants || [];
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.rating = data.rating || 0;
        this.reviewCount = data.reviewCount || 0;
    }

    parseImages(images) {
        if (!images) {
            return [];
        }
        if (Array.isArray(images)) {
            return this.cleanImages(images);
        }
        if (typeof images === "string") {
            try {
                // Xử lý chuỗi JSON lồng nhau
                let parsedImages = images;
                while (typeof parsedImages === "string") {
                    parsedImages = JSON.parse(parsedImages);
                }
                if (Array.isArray(parsedImages)) {
                    return this.cleanImages(parsedImages);
                }
                return this.cleanImages(images.split(",").map(img => img.trim()).filter(img => img));
            } catch (error) {
                console.error("Lỗi khi parse images:", error.message);
                return this.cleanImages(images.split(",").map(img => img.trim()).filter(img => img));
            }
        }
        return [];
    }

    cleanImages(images) {
        const prefix = "https://down-vn.img.susercontent.com/file/";
        return images.map(image => {
            if (typeof image !== "string") {
                return "";
            }
            let cleanedImage = image.replace(/\\"/g, "").replace(/^\["|"\]$/g, "");
            const prefixCount = (cleanedImage.match(/https:\/\/down-vn\.img\.susercontent\.com\/file\//g) || []).length;
            if (prefixCount > 1) {
                const parts = cleanedImage.split(prefix);
                cleanedImage = parts[parts.length - 1];
            }
            if (cleanedImage.startsWith("https://")) {
                return cleanedImage;
            }
            return prefix + cleanedImage;
        }).filter(image => image);
    }

    formatPrice() {
        const price = this.price != null ? this.price : 0;
        console.log("Giá trị price trong formatPrice:", this.price);
        return price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    }

    formatOriginPrice() {
        if (this.origin_price == null || this.origin_price === this.price) {
            return null;
        }
        return this.origin_price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    }

    calculateDiscount() {
        if (this.origin_price == null || this.price == null || this.origin_price <= this.price) {
            return null;
        }
        const discount = Math.round(((this.origin_price - this.price) / this.origin_price) * 100);
        return discount > 0 ? discount : null;
    }

    getColors() {
        if (!this.variants || !Array.isArray(this.variants)) {
            return [];
        }
        const colors = [...new Set(this.variants.map(variant => variant.color_name))];
        return colors.filter(color => color);
    }

    static fromApiData(apiData) {
        if (!Array.isArray(apiData)) {
            return [];
        }
        return apiData.map(item => new Product(item));
    }
}

module.exports = Product;