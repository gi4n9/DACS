class Category {
  constructor(
    category_id,
    brand_id,
    name,
    slug,
    image,
    description,
    parent_id,
    status,
    children
  ) {
    this.category_id = category_id;
    this.brand_id = brand_id;
    this.name = name;
    this.slug = slug;
    this.image = image || null; // Giữ null nếu không có ảnh
    this.description = description || "Không có mô tả"; // Giá trị mặc định nếu null
    this.parent_id = parent_id;
    this.status = status;
    this.children = Array.isArray(children)
      ? this.processChildren(children)
      : []; // Xử lý children
  }

  // Hàm xử lý danh sách children để tạo các instance của Category
  processChildren(children) {
    return children.map(
      (child) =>
        new Category(
          child.category_id,
          child.brand_id,
          child.name,
          child.slug,
          child.image,
          child.description,
          child.parent_id,
          child.status,
          child.children // Đệ quy để xử lý children của children
        )
    );
  }

  // Hàm tĩnh để chuyển đổi dữ liệu API thành instance của Category
  static fromApiData(apiData) {
    // Kiểm tra nếu dữ liệu API có thuộc tính "data"
    const data = apiData.data ? apiData.data : apiData;

    if (Array.isArray(data)) {
      // Nếu dữ liệu là mảng (nhiều danh mục cấp cao nhất)
      return data.map(
        (item) =>
          new Category(
            item.category_id,
            item.brand_id,
            item.name,
            item.slug,
            item.image,
            item.description,
            item.parent_id,
            item.status,
            item.children
          )
      );
    } else {
      // Nếu dữ liệu là một object đơn (một danh mục)
      return new Category(
        data.category_id,
        data.brand_id,
        data.name,
        data.slug,
        data.image,
        data.description,
        data.parent_id,
        data.status,
        data.children
      );
    }
  }

  // Getter để lấy children
  getChildren() {
    return this.children;
  }
}

module.exports = Category;
