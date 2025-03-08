class Category {
  constructor(
    category_id,
    name,
    slug,
    description,
    parent_id,
    status,
    image,
    brand,
    parent_category,
    children
  ) {
    this.category_id = category_id;
    this.name = name;
    this.slug = slug;
    this.description = description || "Không có mô tả"; // Giá trị mặc định nếu null
    this.parent_id = parent_id;
    this.status = status;
    this.image = image || null; // Giữ null nếu không có ảnh
    this.brand = brand || null; // Giữ null nếu không có brand
    this.parent_category = parent_category || null; // Giữ null nếu không có parent_category
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
          child.name,
          child.slug,
          child.description,
          child.parent_id,
          child.status,
          child.image,
          child.brand,
          child.parent_category,
          child.children // Đệ quy để xử lý children của children (nếu có)
        )
    );
  }

  // Hàm tĩnh để chuyển đổi dữ liệu API thành instance của Category
  static fromApiData(data) {
    if (Array.isArray(data)) {
      // Nếu dữ liệu là mảng (nhiều danh mục cấp cao nhất)
      return data.map(
        (item) =>
          new Category(
            item.category_id,
            item.name,
            item.slug,
            item.description,
            item.parent_id,
            item.status,
            item.image,
            item.brand,
            item.parent_category,
            item.children
          )
      );
    } else {
      // Nếu dữ liệu là một object đơn (một danh mục cấp cao nhất)
      return new Category(
        data.category_id,
        data.name,
        data.slug,
        data.description,
        data.parent_id,
        data.status,
        data.image,
        data.brand,
        data.parent_category,
        data.children
      );
    }
  }

  // Getter để lấy children (tùy chọn, giúp truy cập dễ hơn nếu cần)
  getChildren() {
    return this.children;
  }
}

module.exports = Category;
