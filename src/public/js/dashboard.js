// Thêm tương tác cho sidebar
document.querySelectorAll(".sidebar ul li").forEach((item) => {
  item.addEventListener("click", () => {
    // Xóa trạng thái active của mục hiện tại
    document.querySelector(".sidebar ul li.active").classList.remove("active");
    // Thêm trạng thái active cho mục được bấm
    item.classList.add("active");

    // Ẩn tất cả các section trong main-content
    document.querySelectorAll(".content-section").forEach((section) => {
      section.style.display = "none";
    });

    // Xác định section nào sẽ hiển thị dựa trên mục được bấm
    let sectionId;
    if (item.textContent.includes("Trang chủ")) {
      sectionId = "trang-chu";
    } else if (item.textContent.includes("Quản lý đơn hàng")) {
      sectionId = "quan-ly-don-hang";
    } else if (item.textContent.includes("Quản lý sản phẩm")) {
      sectionId = "quan-ly-san-pham";
    } else if (item.textContent.includes("Quản lý người dùng")) {
      sectionId = "quan-ly-nguoi-dung";
    } else if (item.textContent.includes("Thống kê")) {
      sectionId = "thong-ke";
    } else if (item.textContent.includes("Kho")) {
      sectionId = "kho";
    }

    // Hiển thị section tương ứng
    if (sectionId) {
      document.getElementById(sectionId).style.display = "block";
    }
  });
});
