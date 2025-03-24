const API_URL = "https://fshop.nghienshopping.online";

document.addEventListener('DOMContentLoaded', function () {
    initializeCart();
    setupEventListeners();
    loadCitiesFromDatabase();
    migrateCart(); // Ensure migration runs on page load
});

function initializeCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    renderCartItems(cart);
    updateCartSummary();
}

function renderCartItems(cart) {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="text-center py-4"><p>Giỏ hàng của bạn đang trống</p><a href="/homepage" class="btn btn-outline-primary">Tiếp tục mua sắm</a></div>';
        return;
    }

    let html = '';
    const colorNameMap = {
        '#ffffff': 'Trắng',
        '#000000': 'Đen',
        '#ff5733': 'Cam',
        '#0d47a1': 'Xanh dương',
        '#D2B48C': 'Nâu',
        '#D3D3D3': 'Xám nhạt',
        '#F5F5DC': 'Be',
        '#000080': 'Xanh navy',
        '#ADD8E6': 'Xanh nhạt',
        '#e8e6cf': 'Kem'
    };

    cart.forEach(item => {
        html += `
      <div class="card mb-3 cart-item" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">
        <div class="row g-0 h-100">
          <div class="col-md-2 d-flex align-items-center">
            <div class="cart-item-image-container h-100 d-flex align-items-center">
              <img src="${item.images[0]}" class="img-fluid rounded-start" alt="${item.name}" style="width: 80px; object-fit: contain;">
            </div>
          </div>
          <div class="col-md-10">
            <div class="card-body h-100 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between">
                  <h5 class="card-title">${item.name}</h5>
                  <button type="button" class="btn-close" onclick="removeItem('${item.id}', '${item.color}', '${item.size}')"></button>
                </div>
                <p class="card-text mb-1">Màu: ${colorNameMap[item.color] || item.color} | Kích thước: ${item.size}</p>
                <p class="card-text text-primary mb-2">${formatCurrency(item.price)}</p>
                ${item.oldPrice ? `<p class="card-text text-decoration-line-through text-muted mb-1">${item.oldPrice}</p>` : ''}
                ${item.discount ? `<p class="card-text text-danger mb-2">-${item.discount}%</p>` : ''}
              </div>
              <div class="d-flex align-items-center">
                <div class="input-group input-group-sm" style="width: 120px;">
                  <button class="btn btn-outline-secondary" type="button" onclick="decreaseQuantity('${item.id}', '${item.color}', '${item.size}')">-</button>
                  <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                  <button class="btn btn-outline-secondary" type="button" onclick="increaseQuantity('${item.id}', '${item.color}', '${item.size}')">+</button>
                </div>
                <div class="ms-3">
                  <span class="fw-bold">${formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    });

    cartItemsContainer.innerHTML = html;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    const vatAmountElement = document.getElementById('vatAmount');

    if (!subtotalElement) return;

    const totals = calculateTotals(cart);

    subtotalElement.textContent = formatCurrency(totals.subtotal);
    shippingElement.textContent = formatCurrency(totals.shipping);
    totalElement.textContent = formatCurrency(totals.total);
    vatAmountElement.textContent = `(Đã gồm ${formatCurrency(totals.vatAmount)} tiền VAT)`;
}

function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShippingCost();
    const total = subtotal + shipping;
    const vatAmount = Math.round(total * 0.1);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, shipping, total, vatAmount, itemCount };
}

function calculateShippingCost() {
    const citySelect = document.getElementById('city');
    if (!citySelect || !citySelect.value) return 0;

    const provinceCode = citySelect.value;

    if (provinceCode === '01') return 30000; // Hà Nội
    if (provinceCode === '79') return 20000; // Hồ Chí Minh
    if (provinceCode === '48') return 35000; // Đà Nẵng

    return 50000; // Các tỉnh khác
}

function setupEventListeners() {
    const checkoutButtons = document.querySelectorAll('.checkout-button');
    checkoutButtons.forEach(button => {
        button.addEventListener('click', handleCheckout);
    });

    const clearCartButton = document.getElementById('clearCartButton');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }

    const citySelect = document.getElementById('city');
    if (citySelect) {
        citySelect.addEventListener('change', function () {
            updateDistricts(this.value);
            updateCartSummary();
        });
    }

    const districtSelect = document.getElementById('district');
    if (districtSelect) {
        districtSelect.addEventListener('change', function () {
            updateWards(this.value);
        });
    }
}

function handleCheckout() {
    if (validateCheckoutForm()) {
        submitOrder();
    }
}

function clearCart() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        localStorage.removeItem('cart');
        renderCartItems([]);
        updateCartSummary();
    }
}

function increaseQuantity(itemId, color, size) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId && item.color === color && item.size === size);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems(cart);
        updateCartSummary();
    }
}

function decreaseQuantity(itemId, color, size) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId && item.color === color && item.size === size);

    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems(cart);
            updateCartSummary();
        } else {
            removeItem(itemId, color, size);
        }
    }
}

function removeItem(itemId, color, size) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const updatedCart = cart.filter(item => !(item.id === itemId && item.color === color && item.size === size));
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        renderCartItems(updatedCart);
        updateCartSummary();
    }
}

function validateCheckoutForm() {
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'district', 'ward'];
    let isValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && !element.value.trim()) {
            element.classList.add('is-invalid');
            isValid = false;
        } else if (element) {
            element.classList.remove('is-invalid');
        }
    });

    const phoneElement = document.getElementById('phone');
    if (phoneElement && phoneElement.value.trim()) {
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        if (!phoneRegex.test(phoneElement.value.trim())) {
            phoneElement.classList.add('is-invalid');
            isValid = false;
        }
    }

    const emailElement = document.getElementById('email');
    if (emailElement && emailElement.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailElement.value.trim())) {
            emailElement.classList.add('is-invalid');
            isValid = false;
        }
    }

    return isValid;
}

function submitOrder() {
    console.log("submitOrder: Bắt đầu thực thi");

    const citySelect = document.getElementById("city");
    const districtSelect = document.getElementById("district");
    const wardSelect = document.getElementById("ward");

    const { token, payload } = getCookie("token") || { token: null, payload: null };
    const userId = payload ? payload.user_id || payload.sub : null;

    console.log("submitOrder: Token từ cookie:", token);
    console.log("submitOrder: Payload từ token:", payload);
    console.log("submitOrder: userId từ payload:", userId);

    if (!userId || !token) {
        Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Vui lòng đăng nhập trước khi đặt hàng.",
            confirmButtonText: "Đăng nhập",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "/login";
            }
        });
        return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Giỏ hàng trống",
            text: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.",
        });
        return;
    }

    // Validate that all cart items have a variant_id
    const invalidItems = cart.filter(item => !item.variant_id);
    if (invalidItems.length > 0) {
        Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Một số sản phẩm trong giỏ hàng không hợp lệ. Vui lòng xóa và thêm lại các sản phẩm này.",
        });
        return;
    }

    const totals = calculateTotals(cart);
    const orderData = {
        recipient_name: document.getElementById("fullName").value,
        recipient_phone: document.getElementById("phone").value,
        shipping_address: `${document.getElementById("address").value}, ${wardSelect.options[wardSelect.selectedIndex].text}, ${districtSelect.options[districtSelect.selectedIndex].text}, ${citySelect.options[citySelect.selectedIndex].text}`,
        total_price: totals.subtotal,
        shipping_fee: totals.shipping,
        discount: 0,
        amount_paid: totals.total,
        payment_method: document.querySelector('input[name="paymentMethod"]:checked').id === "codPayment" ? "COD" : "OTHER",
        shipping_method: "GHN",
        items: cart.map((item) => ({
            product_id: item.productId || item.id,
            variant_id: item.variant_id, // Use the stored numeric variant_id
            quantity: item.quantity,
            unit_price: item.price,
            discount: item.discount || 0,
            tax: 0,
            subtotal: item.price * item.quantity,
        })),
    };
    console.log("submitOrder: Dữ liệu gửi đi:", orderData);

    fetch(`${API_URL}/api/orders/${userId}/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(orderData),
    })
        .then((response) => {
            console.log("submitOrder: Phản hồi từ server:", response.status, response.statusText);
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) throw new Error("Unauthorized");
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            console.log("submitOrder: Dữ liệu trả về từ server:", data);
            localStorage.removeItem("cart");
            Swal.fire({
                icon: "success",
                title: "Đặt hàng thành công!",
                text: "Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được ghi nhận.",
                confirmButtonText: "OK",
            }).then(() => {
                window.location.href = `/me`;
            });
        })
        .catch((error) => {
            console.error("submitOrder: Lỗi:", error.message);
            let errorMessage = "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.";
            if (error.message === "Unauthorized") {
                errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
            }
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: errorMessage,
                confirmButtonText: "OK",
            }).then((result) => {
                if (error.message === "Unauthorized" && result.isConfirmed) {
                    window.location.href = "/login";
                }
            });
        });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    console.log("cart.js: Toàn bộ cookie:", document.cookie);
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const token = parts.pop().split(";").shift();
        if (token) {
            try {
                const payload = decodeJWT(token);
                return { token, payload };
            } catch (error) {
                console.error("Lỗi khi decode token:", error);
                return { token, payload: null };
            }
        }
    }
    return { token: null, payload: null };
}

function decodeJWT(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
    );
    return JSON.parse(jsonPayload);
}

function loadCitiesFromDatabase() {
    const citySelect = document.getElementById('city');
    if (!citySelect) return;

    citySelect.innerHTML = '<option value="">Chọn Tỉnh/Thành phố</option>';

    fetch('https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1')
        .then(response => response.json())
        .then(data => {
            if (data && data.data && Array.isArray(data.data.data)) {
                data.data.data.forEach(province => {
                    const option = document.createElement('option');
                    option.value = province.code;
                    option.textContent = province.name;
                    citySelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching provinces:', error);
            const fallbackCities = [
                { id: '01', name: 'Hà Nội' },
                { id: '79', name: 'Hồ Chí Minh' },
                { id: '48', name: 'Đà Nẵng' }
            ];
            fallbackCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        });
}

function updateDistricts(provinceCode) {
    const districtSelect = document.getElementById('district');
    if (!districtSelect) return;

    districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
    document.getElementById('ward').innerHTML = '<option value="">Chọn Phường/Xã</option>';

    if (!provinceCode) return;

    fetch(`https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.data && Array.isArray(data.data.data)) {
                data.data.data.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.code;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error fetching districts:', error));
}

function updateWards(districtCode) {
    const wardSelect = document.getElementById('ward');
    if (!wardSelect) return;

    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';

    if (!districtCode) return;

    fetch(`https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${districtCode}&limit=-1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.data && Array.isArray(data.data.data)) {
                data.data.data.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward.code;
                    option.textContent = ward.name;
                    wardSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error fetching wards:', error));
}

function migrateCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return;

    // Check if any cart item is missing variant_id
    const needsMigration = cart.some((item) => !item.variant_id);
    if (!needsMigration) return;

    // Fetch variant_id for each item
    Promise.all(
        cart.map(async (item) => {
            if (item.variant_id) return item;

            try {
                const response = await fetch(`${API_URL}/api/products/${item.productId || item.id}`);
                const productData = await response.json();
                const product = productData.data.product;

                const variant = product.variants.find(
                    (v) => v.color_name === item.color && v.size_name === item.size
                );

                if (variant) {
                    item.variant_id = variant.variant_id;
                } else {
                    console.warn(`Variant not found for product ${item.productId || item.id}, color ${item.color}, size ${item.size}`);
                    return null;
                }
                return item;
            } catch (error) {
                console.error(`Error migrating cart item for product ${item.productId || item.id}:`, error);
                return null;
            }
        })
    ).then((updatedCart) => {
        // Filter out any null items (failed migrations)
        const newCart = updatedCart.filter((item) => item !== null);
        localStorage.setItem("cart", JSON.stringify(newCart));
        renderCartItems(newCart);
        updateCartSummary();
    });
}