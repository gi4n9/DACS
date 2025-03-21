// public/js/cart.js
document.addEventListener('DOMContentLoaded', function () {
    initializeCart();
    setupEventListeners();
    loadCitiesFromDatabase();
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
        '#e8e6cf': 'Kem' // Add the missing color code
    };

    cart.forEach(item => {
        html += `
        <div class="card mb-3 cart-item" data-id="${item.id}" data-color="${item.color}" data-size="${item.size}">
            <div class="row g-0">
                <div class="col-md-2">
                    <img src="${item.images[0]}" class="img-fluid rounded-start" alt="${item.name}" style="width: 60px; height: 80px; object-fit: cover;">
                </div>
                <div class="col-md-10">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title">${item.name}</h5>
                            <button type="button" class="btn-close" onclick="removeItem('${item.id}', '${item.color}', '${item.size}')"></button>
                        </div>
                        <p class="card-text mb-1">Màu: ${colorNameMap[item.color] || item.color} | Kích thước: ${item.size}</p>
                        <p class="card-text text-primary mb-2">${formatCurrency(item.price)}</p>
                        ${item.oldPrice ? `<p class="card-text text-decoration-line-through text-muted mb-1">${item.oldPrice}</p>` : ''}
                        ${item.discount ? `<p class="card-text text-danger mb-2">-${item.discount}%</p>` : ''}
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
    const vatAmount = Math.round(total * 0.1); // 10% VAT
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, shipping, total, vatAmount, itemCount };
}

function calculateShippingCost() {
    const citySelect = document.getElementById('city');
    if (!citySelect || !citySelect.value) return 0;

    // Dựa trên mã tỉnh/thành phố để tính phí ship
    const provinceCode = citySelect.value;
    
    // Hà Nội
    if (provinceCode === '01') return 30000;
    // Hồ Chí Minh
    if (provinceCode === '79') return 20000;
    // Đà Nẵng
    if (provinceCode === '48') return 35000;
    
    // Các tỉnh khác
    return 50000;
}

function setupEventListeners() {
    const checkoutButton = document.getElementById('checkoutButton');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
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

function handleCheckout() {
    if (validateCheckoutForm()) {
        submitOrder();
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
    const citySelect = document.getElementById('city');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    const orderData = {
        customerInfo: {
            prefix: document.getElementById('prefix')?.value || '',
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email')?.value || ''
        },
        shippingAddress: {
            address: document.getElementById('address').value,
            cityCode: citySelect.value,
            cityName: citySelect.options[citySelect.selectedIndex].text,
            districtCode: districtSelect.value,
            districtName: districtSelect.options[districtSelect.selectedIndex].text,
            wardCode: wardSelect.value,
            wardName: wardSelect.options[wardSelect.selectedIndex].text,
            note: document.getElementById('note')?.value || ''
        },
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').id,
        giftOption: document.getElementById('giftOption')?.checked || false,
        items: JSON.parse(localStorage.getItem('cart')) || [],
        totals: calculateTotals(JSON.parse(localStorage.getItem('cart')) || [])
    };

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        localStorage.removeItem('cart');
        window.location.href = `/cart/order-confirmation/${data.orderId}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    });
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
                    option.value = province.code;  // Sử dụng code của tỉnh/thành phố
                    option.textContent = province.name;
                    citySelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching provinces:', error);
            // Fallback nếu API không hoạt động
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
                    option.value = district.code;  // Sử dụng code của quận/huyện
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
                    option.value = ward.code;  // Sử dụng code của phường/xã
                    option.textContent = ward.name;
                    wardSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error fetching wards:', error));
}