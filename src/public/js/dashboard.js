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

  // Thêm sản phẩm mới khi nhấn vào nút #addProductBtn
  const API_BASE = "https://fshop.nghienshopping.online/api";

  function getTokenFromCookie() {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : null;
  }

  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE}/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getTokenFromCookie()}` },
      body: formData,
    });
    const result = await res.json();
    if (!res.ok || !result.url) throw new Error("Upload thất bại");
    return result.url;
  }

  function createInput(labelText, name, type = "text", value = "") {
    const label = document.createElement("label");
    label.textContent = labelText;
    const input = document.createElement("input");
    input.name = name;
    input.type = type;
    input.value = value;
    label.appendChild(input);
    return label;
  }

  function createTextarea(labelText, name, value = "") {
    const label = document.createElement("label");
    label.textContent = labelText;

    const textarea = document.createElement("textarea");
    textarea.name = name;
    textarea.value = value;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept = "image/*";

    const fileUrlsContainer = document.createElement("div");
    fileUrlsContainer.style.marginTop = "10px";

    fileInput.addEventListener("change", async () => {
      fileUrlsContainer.innerHTML = "";
      for (const file of fileInput.files) {
        const url = await uploadImage(file);
        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.name = `${name}_url`;
        urlInput.value = url;
        urlInput.readOnly = true;
        urlInput.style.marginTop = "5px";
        fileUrlsContainer.appendChild(urlInput);
      }
    });

    label.appendChild(textarea);
    label.appendChild(fileInput);
    label.appendChild(fileUrlsContainer);
    return label;
  }

  function createSelect(labelText, name, options) {
    const label = document.createElement("label");
    label.textContent = labelText;
    const select = document.createElement("select");
    select.name = name;
    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    label.appendChild(select);
    return label;
  }

  function createVariantBlock(index) {
    const wrapper = document.createElement("div");
    wrapper.className = "variant-block";
    wrapper.innerHTML = `<strong>Biến thể ${index + 1}</strong>`;
    wrapper.appendChild(createInput("Màu sắc", `variant_color_name_${index}`));
    wrapper.appendChild(
      createInput("Kích thước", `variant_size_name_${index}`)
    );
    wrapper.appendChild(createInput("Giá", `variant_price_${index}`, "number"));
    wrapper.appendChild(
      createInput("Giá gốc", `variant_origin_price_${index}`, "number")
    );
    wrapper.appendChild(
      createInput("Giảm giá", `variant_discount_${index}`, "number")
    );
    wrapper.appendChild(
      createInput("Tồn kho", `variant_stock_${index}`, "number")
    );

    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    const imageUrlInput = document.createElement("input");
    imageUrlInput.name = `variant_image_${index}`;

    const imageLabel = document.createElement("label");
    imageLabel.textContent = "Ảnh biến thể";
    imageInput.addEventListener("change", async () => {
      if (imageInput.files[0]) {
        const url = await uploadImage(imageInput.files[0]);
        imageUrlInput.value = url;
      }
    });

    wrapper.appendChild(imageLabel);
    wrapper.appendChild(imageUrlInput);
    wrapper.appendChild(imageInput);
    return wrapper;
  }

  async function openAddProductPopup() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    const modal = document.createElement("div");
    modal.className = "modal";

    const closeBtn = document.createElement("div");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "✖";
    closeBtn.onclick = () => overlay.remove();

    const form = document.createElement("form");
    form.appendChild(createInput("Tên sản phẩm", "name"));
    form.appendChild(createTextarea("Mô tả", "description"));
    form.appendChild(createInput("Giá", "price", "number"));
    form.appendChild(createInput("Giá gốc", "origin_price", "number"));
    form.appendChild(createInput("Giảm giá", "discount", "number"));
    form.appendChild(createInput("Tồn kho", "stock", "number"));

    const mainImageInput = document.createElement("input");
    mainImageInput.type = "file";
    const mainImageUrl = document.createElement("input");
    mainImageUrl.name = "image";
    mainImageUrl.placeholder = "URL ảnh chính hoặc upload bên dưới";
    mainImageInput.addEventListener("change", async () => {
      if (mainImageInput.files[0]) {
        const url = await uploadImage(mainImageInput.files[0]);
        mainImageUrl.value = url;
      }
    });
    form.appendChild(document.createElement("label")).textContent = "Ảnh";
    form.appendChild(mainImageUrl);
    form.appendChild(mainImageInput);

    const imagesInput = createTextarea(
      "Ảnh chi tiết (1 URL mỗi dòng)",
      "images"
    );
    form.appendChild(imagesInput);

    const [catRes, brandRes] = await Promise.all([
      fetch(`${API_BASE}/cat`).then((res) => res.json()),
      fetch(`${API_BASE}/brands`, {
        headers: { Authorization: `Bearer ${getTokenFromCookie()}` },
      }).then((res) => res.json()),
    ]);

    const catOptions = [];
    function extractCats(cats, prefix = "") {
      for (const cat of cats) {
        catOptions.push({ value: cat.category_id, label: prefix + cat.name });
        if (cat.children?.length) extractCats(cat.children, prefix + "--");
      }
    }
    extractCats(catRes.data);
    const brandOptions = brandRes.map((b) => ({
      value: b.brand_id,
      label: b.name,
    }));

    form.appendChild(createSelect("Danh mục", "category_id", catOptions));
    form.appendChild(createSelect("Thương hiệu", "brand_id", brandOptions));

    let variantIndex = 0;
    const variantContainer = document.createElement("div");
    variantContainer.id = "variant-container";
    const addVariantBtn = document.createElement("button");
    addVariantBtn.type = "button";
    addVariantBtn.textContent = "+ Thêm biến thể";
    addVariantBtn.onclick = () => {
      variantContainer.appendChild(createVariantBlock(variantIndex++));
    };
    addVariantBtn.click();
    form.appendChild(document.createElement("h3")).textContent = "Biến thể";
    form.appendChild(variantContainer);
    form.appendChild(addVariantBtn);

    const submit = document.createElement("button");
    submit.textContent = "Tạo sản phẩm";
    submit.type = "submit";
    form.appendChild(submit);

    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = {
        name: fd.get("name"),
        description: fd.get("description"),
        price: parseFloat(fd.get("price")),
        origin_price: parseFloat(fd.get("origin_price")),
        discount: parseFloat(fd.get("discount")),
        stock: parseInt(fd.get("stock")),
        sold: 0,
        category_id: parseInt(fd.get("category_id")),
        brand_id: parseInt(fd.get("brand_id")),
        image: fd.get("image"),
        images: fd.get("images")?.split("\n").filter(Boolean) || [],
        variants: [],
      };

      for (let i = 0; i < variantIndex; i++) {
        body.variants.push({
          color_name: fd.get(`variant_color_name_${i}`),
          size_name: fd.get(`variant_size_name_${i}`),
          price: parseFloat(fd.get(`variant_price_${i}`)),
          origin_price: parseFloat(fd.get(`variant_origin_price_${i}`)),
          discount: parseFloat(fd.get(`variant_discount_${i}`)),
          stock: parseInt(fd.get(`variant_stock_${i}`)),
          image: fd.get(`variant_image_${i}`),
        });
      }

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenFromCookie()}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Tạo sản phẩm thành công!");
        overlay.remove();
      } else {
        alert("Lỗi: " + (result.error || "Không xác định"));
      }
    };

    modal.appendChild(closeBtn);
    modal.appendChild(form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  async function openEditProductPopup(productId) {
    const res = await fetch(`${API_BASE}/products/${productId}`);
    const { data } = await res.json();
    const product = data.product;
    const category = data.category;

    // Mở popup như thêm mới
    await openAddProductPopup();

    const modal = document.querySelector(".modal");
    const form = modal.querySelector("form");
    modal.querySelector("h3").textContent = "Chỉnh sửa sản phẩm";
    modal.querySelector("button[type='submit']").textContent =
      "Cập nhật sản phẩm";

    // Điền thông tin sản phẩm
    form.querySelector("input[name='name']").value = product.name;
    form.querySelector("textarea[name='description']").value =
      product.description;
    form.querySelector("input[name='price']").value = product.price;
    form.querySelector("input[name='origin_price']").value =
      product.origin_price;
    form.querySelector("input[name='discount']").value = product.discount;
    form.querySelector("input[name='stock']").value = product.stock;
    form.querySelector("input[name='image']").value = product.image;
    form.querySelector("textarea[name='images']").value = (
      JSON.parse(product.images) || []
    ).join("\n");

    form.querySelector("select[name='category_id']").value =
      product.category_id;
    form.querySelector("select[name='brand_id']").value = product.brand;

    // Render lại tất cả variant
    const container = form.querySelector("#variant-container");
    container.innerHTML = "";
    let variantIndex = 0;
    product.variants.forEach((v) => {
      const block = createVariantBlock(variantIndex);
      block.querySelector(
        `input[name='variant_color_name_${variantIndex}']`
      ).value = v.color_name;
      block.querySelector(
        `input[name='variant_size_name_${variantIndex}']`
      ).value = v.size_name;
      block.querySelector(`input[name='variant_price_${variantIndex}']`).value =
        v.price;
      block.querySelector(
        `input[name='variant_origin_price_${variantIndex}']`
      ).value = v.origin_price;
      block.querySelector(
        `input[name='variant_discount_${variantIndex}']`
      ).value = v.discount;
      block.querySelector(`input[name='variant_stock_${variantIndex}']`).value =
        v.stock;
      block.querySelector(`input[name='variant_image_${variantIndex}']`).value =
        v.variant_image;
      container.appendChild(block);
      variantIndex++;
    });

    // Sửa lại onsubmit để gửi PUT request
    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const body = {
        name: fd.get("name"),
        description: fd.get("description"),
        price: parseFloat(fd.get("price")),
        origin_price: parseFloat(fd.get("origin_price")),
        discount: parseFloat(fd.get("discount")),
        stock: parseInt(fd.get("stock")),
        category_id: parseInt(fd.get("category_id")),
        brand_id: parseInt(fd.get("brand_id")),
        image: fd.get("image"),
        images: fd.get("images")?.split("\n").filter(Boolean) || [],
        variants: [],
      };
      for (let i = 0; i < variantIndex; i++) {
        body.variants.push({
          color_name: fd.get(`variant_color_name_${i}`),
          size_name: fd.get(`variant_size_name_${i}`),
          price: parseFloat(fd.get(`variant_price_${i}`)),
          origin_price: parseFloat(fd.get(`variant_origin_price_${i}`)),
          discount: parseFloat(fd.get(`variant_discount_${i}`)),
          stock: parseInt(fd.get(`variant_stock_${i}`)),
          image: fd.get(`variant_image_${i}`),
        });
      }

      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenFromCookie()}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Cập nhật sản phẩm thành công!");
        document.querySelector(".modal-overlay").remove();
        window.location.reload();
      } else {
        alert("Lỗi: " + (result.error || "Không xác định"));
      }
    };
  }

  const modalFixStyle = document.createElement("style");
  modalFixStyle.textContent = `
  .modal form {
    max-height: 90vh;
    overflow-y: auto;
  }
  .variant-block {
    margin-bottom: 20px;
  }
`;
  document.head.appendChild(modalFixStyle);

  document.addEventListener("click", (event) => {
    const target = event.target;

    // Handle "Add Product" button
    if (target.id === "addProductBtn") {
      openAddProductPopup();
    }

    // Handle "Edit" button
    if (target.classList.contains("edit-btn")) {
      const productId = target.dataset.id || target.id;
      openEditProductPopup(productId);
    }

    // Handle "Delete" button
    if (target.classList.contains("delete-btn")) {
      const productId = target.parentElement.parentElement.dataset.id;
      if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        fetch(`${API_BASE}/products/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${window.authToken}`,
          },
        }).then((res) => {
          if (res.ok) {
            alert("Xóa sản phẩm thành công!");
            window.location.reload();
          } else {
            alert("Xóa sản phẩm thất bại!");
          }
        });
      }
    }
  });

  async function fetchOrders() {
    const token = getTokenFromCookie();
    if (!token) return alert("Không tìm thấy token!");

    try {
      const response = await fetch(
        "https://fshop.nghienshopping.online/api/orders/getall",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orders = await response.json();
      renderOrders(orders);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
    }
  }

  function renderOrders(data) {
    const tbody = document.querySelector("#quan-ly-don-hang table tbody");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12">Không có đơn hàng nào để hiển thị.</td></tr>`;
      return;
    }

    data.forEach((order) => {
      let statusText = getStatusBadge(order.status);
      const row = `
                <tr>
                    <td>${order.order_id}</td>
                    <td>${order.recipient_name}</td>
                    <td>${order.recipient_phone}</td>
                    <td>${order.shipping_address}</td>
                    <td>${order.amount_paid} đ</td>
                    <td>${order.payment_method}</td>
                    <td>${statusText}</td>
                    <td>${order.created_at}</td>
                    <td>
                        <button class="action-btn view-order-btn" data-id="${order.order_id}" data-user="${order.user_id}">Xem</button>
                        <button class="action-btn edit-order-btn" data-id="${order.order_id}" data-user="${order.user_id}">Sửa</button>
                    </td>
                </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  }

  function getStatusBadge(status) {
    const map = {
      pending: "Đang xử lý",
      processing: "Đang chuẩn bị",
      delivering: "Đang giao",
      delivered: "Hoàn thành",
      cancelled: "Đã hủy",
      returning: "Đang hoàn hàng",
      returned: "Đã hoàn hàng",
    };
    return `<span class="status ${status}">${map[status] || status}</span>`;
  }

  // Helper: Render modal
  function openModal(content) {
    let modal = document.getElementById("order-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "order-modal";
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0,0,0,0.5)";
      modal.style.display = "flex";
      modal.style.alignItems = "center";
      modal.style.justifyContent = "center";
      modal.innerHTML = `
      <div style="background:#fff; padding:20px; border-radius:10px; width:700px; max-height:90vh; overflow:auto;">
        <div id="modal-content"></div>
        <div style="text-align:right; margin-top:10px;">
          <button onclick="document.getElementById('order-modal').remove()">Đóng</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
    }
    document.getElementById("modal-content").innerHTML = content;
  }

  // View order detail with product and variant info
  async function openOrderDetails(userId, orderId) {
    const token = getTokenFromCookie();
    try {
      // Fetch order details
      const orderRes = await fetch(
        `https://fshop.nghienshopping.online/api/orders/${userId}/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const order = await orderRes.json();

      // Fetch product details for each product in the order
      const itemsHtml = await Promise.all(
        order.items.map(async (item) => {
          const productRes = await fetch(
            `https://fshop.nghienshopping.online/api/products/${item.product_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const productData = await productRes.json();
          const product = productData.data.product;

          // Find the matching variant
          const variant = product.variants.find(
            (v) => v.variant_id === item.variant_id
          );

          return `
                    <tr>
                        <td><img src="${variant.variant_image}" alt="${product.name}"></td>
                        <td>${product.name}</td>
                        <td>${variant.color_name}</td>
                        <td>${variant.size_name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit_price} đ</td>
                    </tr>
                `;
        })
      );

      // Render modal content
      const html = `
                <div class="order-details-header">
                    <h3>Chi tiết đơn hàng #${order.order_id}</h3>
                    <p><strong>Người nhận:</strong> ${order.recipient_name}</p>
                    <p><strong>Địa chỉ:</strong> ${order.shipping_address}</p>
                    <p><strong>Phương thức thanh toán:</strong> ${
                      order.payment_method
                    }</p>
                    <p><strong>Trạng thái:</strong> ${getStatusBadge(
                      order.status
                    )}</p>
                </div>
                <table class="order-details-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Màu sắc</th>
                            <th>Kích thước</th>
                            <th>Số lượng</th>
                            <th>Giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml.join("")}
                    </tbody>
                </table>
            `;

      openModal(html);
    } catch (err) {
      console.error("Lỗi chi tiết đơn hàng:", err);
    }
  }

  // Sửa trạng thái đơn hàng
  async function openEditOrderPopup(userId, orderId) {
    const token = getTokenFromCookie();
    try {
      const res = await fetch(
        `https://fshop.nghienshopping.online/api/orders/${userId}/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      const html = `
                <h3>Cập nhật đơn hàng #${data.order_id}</h3>
                <p><strong>Người nhận:</strong> ${data.recipient_name}</p>
                <p><strong>Địa chỉ:</strong> ${data.shipping_address}</p>
                <label>Trạng thái:</label>
                <select id="new-status">
                    <option value="pending">Đang xử lý</option>
                    <option value="processing">Đang chuẩn bị</option>
                    <option value="delivering">Đang giao</option>
                    <option value="delivered">Hoàn thành</option>
                    <option value="returning">Đang hoàn hàng</option>
                    <option value="returned">Đã hoàn hàng</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
                <div style="margin-top:10px;">
                    <button onclick="submitStatusUpdate('${userId}', '${orderId}')">Cập nhật</button>
                </div>`;
      openModal(html);

      // Gán mặc định
      setTimeout(() => {
        document.getElementById("new-status").value = data.status;
      }, 100);
    } catch (err) {
      console.error("Lỗi:", err);
    }
  }

  async function submitStatusUpdate(userId, orderId) {
    const token = getTokenFromCookie();
    const newStatus = document.getElementById("new-status").value;

    try {
      const res = await fetch(
        `https://fshop.nghienshopping.online/api/orders/${userId}/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await res.json();
      alert(result.message || "Cập nhật thành công!");
      fetchOrders();
      document.getElementById("order-modal").remove();
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
    }
  }

  // Sự kiện click
  document.addEventListener("click", (event) => {
    const btn = event.target;
    if (btn.classList.contains("view-order-btn")) {
      openOrderDetails(btn.dataset.user, btn.dataset.id);
    }
    if (btn.classList.contains("edit-order-btn")) {
      openEditOrderPopup(btn.dataset.user, btn.dataset.id);
    }
  });

  document
    .getElementById("reload-orders")
    .addEventListener("click", fetchOrders);

  // Tải ban đầu
  document.addEventListener("DOMContentLoaded", fetchOrders);
});
