document.addEventListener('DOMContentLoaded', function () {
    // Product data extracted from the DOM
    const product = {
        id: getProductId(),
        name: document.querySelector('h1.fw-bold')?.textContent || 'Unknown Product',
        price: parseInt(document.querySelector('h3.fw-bold.text-dark')?.textContent.replace(/[^0-9]/g, '') || 0),
        oldPrice: document.querySelector('p.text-decoration-line-through')?.textContent || null,
        discount: parseInt(document.querySelector('.badge.bg-danger')?.textContent.replace(/[^0-9]/g, '') || 0),
        description: document.querySelector('p.mb-1')?.textContent || '',
        shipping: document.querySelector('p.mb-3')?.textContent || '',
        images: Array.from(document.querySelectorAll('#productCarousel img')).map(img => img.src),
        variants: JSON.parse(document.querySelector('#productVariants')?.textContent || '[]')
    };

    // Process variants to get unique colors and sizes
    function processProductVariants(variants) {
        const uniqueColors = [...new Set(variants.map(variant => variant.color_name))];
        const uniqueSizes = [...new Set(variants.map(variant => variant.size_name))];
        return { colors: uniqueColors, sizes: uniqueSizes };
    }

    // Map color names to hex codes
    function getColorCode(colorName) {
        const colorMap = {
            'TRẮNG': '#ffffff',
            'ĐEN': '#000000',
            'CAM': '#ff5733',
            'XANH DƯƠNG': '#0d47a1',
            'NÂU': '#D2B48C',
            'XÁM NHẠT': '#D3D3D3',
            'BE': '#e8e0d3',
            'XANH NAVY': '#232a38',
            'XANH NHẠT': '#ADD8E6',
            'KEM': '#e8e6cf',
            'XÁM': '#d4d4d4',
            'ĐỎ': '#ff0000',
            'NÂU SÂU': '#4A2C2A', // Màu nâu đậm
            'XANH MINT': '#dadbd5', // Màu xanh bạc hà nhạt
            'XANH RÊU': '#334134', // Màu xanh rêu
            'XANH TÍM': '#b0b6c3', // Màu xanh tím
            'XANH ĐẬM': '#174283', // Màu xanh đậm
            'XANH BIỂN': '#3c4353', // Màu xanh biển
            'XANH PASTEL': '#cbdde9', // Màu xanh pastel
            'XÁM MELANGE': '#929092', // Màu xám melange (xám trung bình)
            'ĐỎ ZIFANDEL': '#6c3034', // Màu đỏ rượu vang đậm
            'XÁM CASTLEROCK': '#757576', // Màu xám castlerock
            'NÂU CAPPUCCINO': '#7e523b', // Màu nâu cappuccino
            'XANH FOREST': '#228B22', // Màu xanh rừng
            'HỒNG': '#FF69B4', // Màu hồng
            'BE 220GSM': '#F5F5DC' // Giữ giống màu BE
        };
        return colorMap[colorName.toUpperCase()] || '#000000';
    }

    // Render color options
    function renderColorOptions(variants) {
        const { colors } = processProductVariants(variants);
        const colorOptionsContainer = document.getElementById('colorOptions');
        if (colorOptionsContainer) {
            // Thêm style để các ô màu tự động xuống hàng
            colorOptionsContainer.style.display = 'flex';
            colorOptionsContainer.style.flexWrap = 'wrap';
            colorOptionsContainer.style.gap = '10px'; // Khoảng cách giữa các ô màu

            let html = '';
            colors.forEach((color, index) => {
                const colorCode = getColorCode(color);
                html += `
                    <div class="color-option position-relative ${index === 0 ? 'selected' : ''}"
                         data-color="${color}" style="flex: 0 0 auto;">
                        <div class="border rounded-circle p-1" style="width: 40px; height: 40px; cursor: pointer;">
                            <div class="rounded-circle w-100 h-100" style="background-color: ${colorCode}"></div>
                        </div>
                        <div class="color-selected-indicator"></div>
                    </div>
                `;
            });
            colorOptionsContainer.innerHTML = html;
        }
    }

    // Handle color selection and update image
    function addColorSelectionListeners(variants) {
        const colorOptions = document.querySelectorAll('.color-option');
        const carouselInner = document.querySelector('#productCarousel .carousel-inner');
        const thumbnails = document.querySelectorAll('.thumbnail-preview');

        colorOptions.forEach(option => {
            option.addEventListener('click', function () {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                const selectedColor = this.getAttribute('data-color');
                document.getElementById('selectedColor').textContent = selectedColor;

                const matchingVariant = variants.find(variant => variant.color_name === selectedColor);
                if (matchingVariant && matchingVariant.variant_image) {
                    thumbnails.forEach(thumb => thumb.style.display = 'none');
                    carouselInner.innerHTML = `
                        <div class="carousel-item active">
                            <img src="${matchingVariant.variant_image}" class="d-block w-100 rounded" alt="Ảnh biến thể">
                        </div>
                    `;
                } else {
                    thumbnails.forEach(thumb => thumb.style.display = 'block');
                    carouselInner.innerHTML = product.images.map((img, index) => `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <img src="${img}" class="d-block w-100 rounded" alt="Ảnh sản phẩm">
                        </div>
                    `).join('');
                }
            });
        });
    }

    // Handle size selection
    function addSizeSelectionListeners() {
        const sizeButtons = document.querySelectorAll('.size-btn');
        const addToCartBtn = document.getElementById('addToCartBtn');

        sizeButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                sizeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                addToCartBtn.innerHTML = '<i class="bi bi-bag-check me-2"></i>Thêm vào giỏ hàng';
            });
        });
    }

    // Read more/less functionality
    const productDetailsCollapse = document.getElementById('productDetailsCollapse');
    const readMoreBtn = document.getElementById('readMoreBtn');

    if (readMoreBtn && productDetailsCollapse) {
        readMoreBtn.addEventListener('click', function () {
            if (productDetailsCollapse.style.maxHeight === '300px' || productDetailsCollapse.style.maxHeight === '') {
                productDetailsCollapse.style.maxHeight = '2000px';
                readMoreBtn.textContent = 'THU GỌN';
            } else {
                productDetailsCollapse.style.maxHeight = '300px';
                readMoreBtn.textContent = 'XEM THÊM';
            }
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

    // Add to Cart functionality
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function () {
            const selectedSize = document.querySelector('.size-btn.active')?.getAttribute('data-size') || null;
            const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color') || null;

            if (!selectedSize || !selectedColor) {
                showErrorModal('Bạn chưa chọn ' + (!selectedSize && !selectedColor ? 'kích thước và màu sắc' : !selectedSize ? 'kích thước' : 'màu sắc'));
            } else {
                const quantity = parseInt(quantityInput.value) || 1;

                const cartProduct = {
                    id: product.id,
                    name: product.name,
                    images: product.images,
                    color: selectedColor,
                    size: selectedSize,
                    quantity: quantity,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    discount: product.discount
                };

                addToCart(cartProduct);
                showSuccessMessage(
                    product.name,
                    `${product.price.toLocaleString('vi-VN')}đ`,
                    product.images[0],
                    selectedColor,
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

    // Initialize
    renderColorOptions(product.variants);
    addColorSelectionListeners(product.variants);
    addSizeSelectionListeners();
    updateCartCount();
});