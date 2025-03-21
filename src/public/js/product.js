// public/js/product.js
// Đảm bảo DOM đã tải hoàn toàn trước khi chạy script
document.addEventListener('DOMContentLoaded', function () {
    // Định nghĩa map màu sắc
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
        '#e8e6cf': 'Kem', // Added missing color
        '#d4d4d4': 'Xám', // Added missing color
        '#ff0000': 'Đỏ' // Added missing color
    };

    // Product data extracted from the DOM (or could be fetched via API)
    const product = {
        id: getProductId(),
        name: document.querySelector('h1.fw-bold')?.textContent || 'Unknown Product',
        price: parseInt(document.querySelector('h3.fw-bold.text-dark')?.textContent.replace(/[^0-9]/g, '') || 0),
        oldPrice: document.querySelector('p.text-decoration-line-through')?.textContent || null,
        discount: parseInt(document.querySelector('.badge.bg-danger')?.textContent.replace(/[^0-9]/g, '') || 0),
        description: document.querySelector('p.mb-1')?.textContent || '',
        shipping: document.querySelector('p.mb-3')?.textContent || '',
        images: Array.from(document.querySelectorAll('#productCarousel img')).map(img => img.src),
        colors: ["#e8e6cf", "#d4d4d4", "#000000", "#0d47a1"], // Hardcoded for product ID 1; adjust dynamically if needed
        sizes: Array.from(document.querySelectorAll('#sizeOptions .size-btn')).map(btn => btn.textContent.trim())
    };

    // Render colors dynamically
    function renderColors() {
        const colorOptionsContainer = document.getElementById('colorOptions');
        if (!colorOptionsContainer) return;

        let html = '';
        product.colors.forEach((color, index) => {
            const colorName = colorNameMap[color] || 'Màu khác';
            html += `
                <div class="color-option position-relative me-2 ${index === 0 ? 'selected' : ''}"
                     data-color="${colorName}">
                    <div class="border rounded-circle p-1" style="width: 40px; height: 40px; cursor: pointer;">
                        <div class="rounded-circle w-100 h-100" style="background-color: ${color}"></div>
                    </div>
                    <div class="color-selected-indicator"></div>
                </div>
            `;
        });
        colorOptionsContainer.innerHTML = html;

        // Update selected color text
        updateSelectedColor();
    }

    function updateSelectedColor() {
        const selectedColorSpan = document.getElementById('selectedColor');
        if (!selectedColorSpan) return;

        const selectedColorOption = document.querySelector('.color-option.selected');
        if (selectedColorOption) {
            selectedColorSpan.textContent = selectedColorOption.getAttribute('data-color');
        }
    }

    // Read more/less functionality
    const productDetailsCollapse = document.getElementById('productDetailsCollapse');
    const readMoreBtn = document.getElementById('readMoreBtn');

    if (readMoreBtn && productDetailsCollapse) {
        readMoreBtn.addEventListener('click', function () {
            if (productDetailsCollapse.style.maxHeight === '300px' || productDetailsCollapse.style.maxHeight === '' || getComputedStyle(productDetailsCollapse).maxHeight === '300px') {
                productDetailsCollapse.style.maxHeight = '2000px';
                readMoreBtn.textContent = 'THU GỌN';
            } else {
                productDetailsCollapse.style.maxHeight = '300px';
                readMoreBtn.textContent = 'XEM THÊM';
            }
        });
    }

    // Size button selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    const addToCartBtn = document.querySelector('.btn-dark.flex-grow-1');

    if (sizeButtons.length > 0 && addToCartBtn) {
        sizeButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                sizeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                addToCartBtn.innerHTML = '<i class="bi bi-bag-check me-2"></i>Thêm vào giỏ hàng';
            });
        });
    }

    // Quantity buttons
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const quantityInput = document.getElementById('quantityInput');

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value) || 1;
            if (value > 1) quantityInput.value = value - 1;
        });

        increaseBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value) || 1;
            quantityInput.value = value + 1;
        });
    }

    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    const selectedColorText = document.getElementById('selectedColor');
    let selectedColorCode = null;

    if (colorOptions.length > 0 && selectedColorText) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function () {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                const colorDiv = this.querySelector('.rounded-circle');
                selectedColorCode = colorDiv?.style.backgroundColor || this.dataset.color;
                selectedColorText.textContent = colorNameMap[selectedColorCode] || this.dataset.color || 'Màu khác';
            });
        });
    }

    // Product thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-preview');
    const productCarousel = document.getElementById('productCarousel');

    if (thumbnails.length > 0 && productCarousel) {
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function () {
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');
                try {
                    const bsCarousel = new bootstrap.Carousel(productCarousel);
                    bsCarousel.to(index);
                } catch (error) {
                    console.error('Bootstrap carousel error:', error);
                    const carouselItems = productCarousel.querySelectorAll('.carousel-item');
                    carouselItems.forEach((item, i) => {
                        if (i === index) item.classList.add('active');
                        else item.classList.remove('active');
                    });
                }
            });
        });

        thumbnails[0].classList.add('active');

        if (productCarousel) {
            productCarousel.addEventListener('slid.bs.carousel', function (event) {
                const activeIndex = event.to;
                thumbnails.forEach((thumb, i) => {
                    if (i === activeIndex) thumb.classList.add('active');
                    else thumb.classList.remove('active');
                });
            });
        }
    }

    // Size guide modal functionality
    const sizeGuideLinks = document.querySelectorAll('a[href="#"][data-target="size-guide"]');
    sizeGuideLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sizeGuideModal = new bootstrap.Modal(document.getElementById('sizeGuideModal'));
            sizeGuideModal.show();
        });
    });

    const heightSlider = document.getElementById('heightSlider');
    const weightSlider = document.getElementById('weightSlider');
    const heightValue = document.getElementById('heightValue');
    const weightValue = document.getElementById('weightValue');

    if (heightSlider && heightValue) {
        heightSlider.addEventListener('input', function () {
            heightValue.textContent = this.value + 'cm';
            recommendSize();
        });
    }

    if (weightSlider && weightValue) {
        weightSlider.addEventListener('input', function () {
            weightValue.textContent = this.value + 'kg';
            recommendSize();
        });
    }

    const bodyTypeCards = document.querySelectorAll('.body-type-card');
    bodyTypeCards.forEach(card => {
        card.addEventListener('click', function () {
            bodyTypeCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            recommendSize();
        });
    });

    function recommendSize() {
        if (!heightSlider || !weightSlider) return;

        const height = parseInt(heightSlider.value);
        const weight = parseInt(weightSlider.value);
        const selectedBodyCard = document.querySelector('.body-type-card.selected');
        const bodyType = selectedBodyCard ? selectedBodyCard.dataset.bodyType : 'normal';

        let recommendedSize = '';
        let recommendItems = [];

        if (height >= 150 && height < 160) recommendedSize = 'S';
        else if (height >= 160 && height < 166) recommendedSize = 'M';
        else if (height >= 166 && height < 172) recommendedSize = 'L';
        else if (height >= 172 && height < 178) recommendedSize = 'XL';
        else if (height >= 178 && height < 184) recommendedSize = '2XL';
        else if (height >= 184 && height < 189) recommendedSize = '3XL';
        else if (height >= 189) recommendedSize = '4XL';

        if (weight >= 48 && weight < 55) { /* S range */ }
        else if (weight >= 55 && weight < 62) { if (recommendedSize === 'S') recommendedSize = 'M'; }
        else if (weight >= 62 && weight < 69) { if (recommendedSize === 'S' || recommendedSize === 'M') recommendedSize = 'L'; }
        else if (weight >= 69 && weight < 76) { if (recommendedSize === 'S' || recommendedSize === 'M' || recommendedSize === 'L') recommendedSize = 'XL'; }
        else if (weight >= 76 && weight < 83) { if (recommendedSize === 'S' || recommendedSize === 'M' || recommendedSize === 'L' || recommendedSize === 'XL') recommendedSize = '2XL'; }
        else if (weight >= 83 && weight < 88) { if (recommendedSize === 'S' || recommendedSize === 'M' || recommendedSize === 'L' || recommendedSize === 'XL' || recommendedSize === '2XL') recommendedSize = '3XL'; }
        else if (weight >= 88) recommendedSize = '4XL';

        if (bodyType === 'slim' && recommendedSize !== 'S') {
            const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
            const currentIndex = sizes.indexOf(recommendedSize);
            if (currentIndex > 0) recommendedSize = sizes[currentIndex - 1];
        } else if (bodyType === 'heavy' && recommendedSize !== '4XL') {
            const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
            const currentIndex = sizes.indexOf(recommendedSize);
            if (currentIndex < sizes.length - 1) recommendedSize = sizes[currentIndex + 1];
        }

        recommendItems.push(`${recommendedSize} - Áo`);
        displayRecommendations(recommendItems);
        highlightRecommendedSize(recommendedSize);
    }

    function displayRecommendations(items) {
        const existingRecommend = document.querySelector('.coolmate-recommend');
        if (existingRecommend) existingRecommend.remove();

        const recommendContainer = document.createElement('div');
        recommendContainer.className = 'coolmate-recommend mt-3';
        recommendContainer.innerHTML = `
            <p class="mb-2">Coolmate gợi ý bạn:</p>
            <div class="d-flex flex-wrap">
                ${items.map(item => `<button class="btn btn-dark rounded-pill me-2 mb-2 px-3">${item}</button>`).join('')}
            </div>
        `;

        const bodyTypeContainer = document.querySelector('.body-type-card').closest('.row');
        if (bodyTypeContainer) bodyTypeContainer.after(recommendContainer);
    }

    function highlightRecommendedSize(size) {
        sizeButtons.forEach(btn => {
            if (btn.textContent.trim() === size) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    // Add to Cart functionality
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function () {
            let selectedSize = null;
            const sizeSelected = Array.from(sizeButtons).some(btn => {
                if (btn.classList.contains('active')) {
                    selectedSize = btn.textContent.trim();
                    return true;
                }
                return false;
            });

            let selectedColorCode = null;
            const colorSelected = Array.from(colorOptions).some(option => {
                if (option.classList.contains('selected')) {
                    selectedColorCode = option.querySelector('.rounded-circle')?.style.backgroundColor || option.dataset.color;
                    return true;
                }
                return false;
            });

            if (!sizeSelected || !colorSelected) {
                showErrorModal('Bạn chưa chọn ' + (!sizeSelected && !colorSelected ? 'kích thước và màu sắc' : !sizeSelected ? 'kích thước' : 'màu sắc'));
            } else {
                const quantity = parseInt(quantityInput.value) || 1;

                const cartProduct = {
                    id: product.id,
                    name: product.name,
                    images: product.images,
                    color: selectedColorCode,
                    size: selectedSize,
                    quantity: quantity,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    discount: product.discount
                };

                addToCart(cartProduct);
                showSuccessMessage(
                    product.name,
                    `${product.price}đ`,
                    product.images[0],
                    colorNameMap[selectedColorCode] || 'Màu khác',
                    selectedSize,
                    quantity
                );
                this.innerHTML = '<i class="bi bi-check-circle me-2"></i>Đã thêm vào giỏ hàng';
                setTimeout(() => {
                    this.innerHTML = '<i class="bi bi-bag-check me-2"></i>Thêm vào giỏ hàng';
                }, 3000);
            }
        });
    }

    function showErrorModal(message) {
        let errorModal = document.getElementById('errorModal');
        if (!errorModal) {
            errorModal = document.createElement('div');
            errorModal.id = 'errorModal';
            errorModal.className = 'modal fade';
            errorModal.setAttribute('tabindex', '-1');
            errorModal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-body p-4 text-center">
                            <p class="mb-0">${message}</p>
                        </div>
                        <div class="modal-footer justify-content-center border-0">
                            <button type="button" class="btn btn-primary px-4" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(errorModal);
        } else {
            errorModal.querySelector('.modal-body p').textContent = message;
        }
        new bootstrap.Modal(errorModal).show();
    }

    function showSuccessMessage(productName, productPrice, productImage, color, size, quantity) {
        const existingMessage = document.getElementById('successMessage');
        if (existingMessage) existingMessage.remove();

        const successMessage = document.createElement('div');
        successMessage.id = 'successMessage';
        successMessage.className = 'position-fixed top-0 end-0 p-3';
        successMessage.style.zIndex = '1050';
        successMessage.style.maxWidth = '320px';
        successMessage.innerHTML = `
            <div class="card border-0 shadow">
                <div class="card-header bg-white border-bottom border-1 py-2">
                    <h6 class="mb-0">Đã thêm vào giỏ hàng!</h6>
                </div>
                <div class="card-body p-3">
                    <div class="d-flex">
                        <div class="me-3">
                            <img src="${productImage}" alt="Product" class="img-fluid" style="width: 60px; height: 80px; object-fit: cover;">
                        </div>
                        <div class="flex-grow-1">
                            <p class="mb-1 fw-bold">${productName}</p>
                            <p class="mb-0 small">${color} / ${size}</p>
                            <p class="mb-0 text-primary">${productPrice}</p>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-0 p-0">
                    <a href="/cart" class="btn btn-outline-dark w-100 rounded-0 rounded-bottom py-2">Xem giỏ hàng</a>
                </div>
            </div>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 5000);
    }

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItemIndex = cart.findIndex(item =>
            item.id === product.id && item.color === product.color && item.size === product.size
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += product.quantity;
        } else {
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function getProductId() {
        const urlPath = window.location.pathname;
        const matches = urlPath.match(/\/product\/(\d+)/);
        return matches ? matches[1] : 'temp_' + Date.now();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
            if (cartCount > 0) cartCountElement.classList.remove('d-none');
            else cartCountElement.classList.add('d-none');
        }
    }

    // Initialize colors and cart count
    renderColors();
    updateCartCount();
});