// js/dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  // Thêm tương tác cho sidebar
  document.querySelectorAll(".sidebar ul li").forEach((item) => {
    item.addEventListener("click", () => {
      document
        .querySelector(".sidebar ul li.active")
        .classList.remove("active");
      item.classList.add("active");

      document.querySelectorAll(".content-section").forEach((section) => {
        section.style.display = "none";
      });

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

      if (sectionId) {
        document.getElementById(sectionId).style.display = "block";
      }
    });
  });

  // // Xử lý form thêm sản phẩm
  // const addForm = document.getElementById("add-product-form");
  // if (addForm) {
  //   addForm.addEventListener("submit", async (e) => {
  //     e.preventDefault();
  //     const formData = new FormData(addForm);
  //     const productData = {
  //       category_id: parseInt(formData.get("category_id")),
  //       brand_id: parseInt(formData.get("brand_id")),
  //       name: formData.get("name"),
  //       description: formData.get("description"),
  //       price: parseFloat(formData.get("price")),
  //       origin_price: parseFloat(formData.get("origin_price")),
  //       discount: parseFloat(formData.get("discount")),
  //       stock: parseInt(formData.get("stock")),
  //       sold: 0, // Mặc định khi thêm mới
  //       image: formData.get("image"),
  //       images: formData.get("images") ? formData.get("images").split(",") : [],
  //       variants: [], // Có thể thêm logic để nhập variants nếu cần
  //     };

  //     try {
  //       const response = await fetch("/admin/products", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify(productData),
  //       });
  //       const result = await response.json();
  //       if (result.status) {
  //         alert("Thêm sản phẩm thành công!");
  //         location.reload();
  //       } else {
  //         alert(result.message);
  //       }
  //     } catch (error) {
  //       alert("Lỗi khi thêm sản phẩm: " + error.message);
  //     }
  //   });
  // }

  // // Xử lý nút sửa
  // document.querySelectorAll(".edit-btn").forEach((btn) => {
  //   btn.addEventListener("click", async (e) => {
  //     const row = e.target.closest("tr");
  //     const id = row.dataset.id;

  //     // Lấy thông tin sản phẩm hiện tại từ server
  //     try {
  //       const response = await fetch(`/admin/products/${id}`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //       });
  //       const product = await response.json();

  //       if (product.status) {
  //         // Hiển thị modal và điền dữ liệu
  //         const modal = document.getElementById("edit-modal");
  //         modal.style.display = "block";

  //         // Điền thông tin sản phẩm vào form
  //         document.getElementById("edit-id").value = id;
  //         document.getElementById("edit-category-id").value =
  //           product.data.category_id || "";
  //         document.getElementById("edit-brand").value =
  //           product.data.brand_id || "";
  //         document.getElementById("edit-name").value = product.data.name || "";
  //         document.getElementById("edit-description").value =
  //           product.data.description || "";
  //         document.getElementById("edit-price").value =
  //           product.data.price || "";
  //         document.getElementById("edit-origin-price").value =
  //           product.data.origin_price || "";
  //         document.getElementById("edit-discount").value =
  //           product.data.discount || "";
  //         document.getElementById("edit-stock").value =
  //           product.data.stock || "";
  //         document.getElementById("edit-image").value =
  //           product.data.image || "";
  //         document.getElementById("edit-images").value = product.data.images
  //           ? JSON.stringify(product.data.images)
  //           : "[]";
  //       } else {
  //         alert("Không thể lấy thông tin sản phẩm: " + product.message);
  //       }
  //     } catch (error) {
  //       alert("Lỗi khi lấy thông tin sản phẩm: " + error.message);
  //     }
  //   });
  // });

  // const updateForm = document.getElementById("update-product-form");
  // if (updateForm) {
  //   updateForm.addEventListener("submit", async (e) => {
  //     e.preventDefault();
  //     const formData = new FormData(updateForm);
  //     const id = formData.get("id");

  //     // Tạo object chỉ chứa các trường đã thay đổi
  //     const productData = {};
  //     if (formData.get("category_id"))
  //       productData.category_id = parseInt(formData.get("category_id"));
  //     if (formData.get("brand"))
  //       productData.brand_id = parseInt(formData.get("brand"));
  //     if (formData.get("name")) productData.name = formData.get("name");
  //     if (formData.get("description"))
  //       productData.description = formData.get("description");
  //     if (formData.get("price"))
  //       productData.price = parseFloat(formData.get("price"));
  //     if (formData.get("origin_price"))
  //       productData.origin_price = parseFloat(formData.get("origin_price"));
  //     if (formData.get("discount"))
  //       productData.discount = parseFloat(formData.get("discount"));
  //     if (formData.get("stock"))
  //       productData.stock = parseInt(formData.get("stock"));
  //     if (formData.get("image")) productData.image = formData.get("image");
  //     if (formData.get("images"))
  //       productData.images = JSON.parse(formData.get("images") || "[]");

  //     try {
  //       const response = await fetch(`/admin/products/${id}`, {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify(productData),
  //       });
  //       const result = await response.json();
  //       if (result.status) {
  //         alert("Cập nhật sản phẩm thành công!");
  //         document.getElementById("edit-modal").style.display = "none";
  //         location.reload();
  //       } else {
  //         alert(result.message);
  //       }
  //     } catch (error) {
  //       alert("Lỗi khi cập nhật sản phẩm: " + error.message);
  //     }
  //   });
  // }

  // window.hideEditModal = function () {
  //   document.getElementById("edit-modal").style.display = "none";
  // };

  // // Xử lý nút xóa
  // document.querySelectorAll(".delete-btn").forEach((btn) => {
  //   btn.addEventListener("click", async (e) => {
  //     const row = e.target.closest("tr");
  //     const id = row.dataset.id;
  //     if (confirm(`Bạn có chắc muốn xóa sản phẩm ID ${id}?`)) {
  //       try {
  //         const response = await fetch(`/admin/products/${id}`, {
  //           method: "DELETE",
  //           credentials: "include",
  //         });
  //         const result = await response.json();
  //         if (result.status) {
  //           alert("Xóa sản phẩm thành công!");
  //           location.reload();
  //         } else {
  //           alert(result.message);
  //         }
  //       } catch (error) {
  //         alert("Lỗi khi xóa sản phẩm: " + error.message);
  //       }
  //     }
  //   });
  // });
});
