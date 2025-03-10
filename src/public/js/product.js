// Đảm bảo DOM đã tải hoàn toàn trước khi chạy script
document.addEventListener('DOMContentLoaded', function () {
    // Định nghĩa map màu sắc trực tiếp thay vì sử dụng Handlebars helper
    const colorNameMap = {
        '#ffffff': 'Trắng',
        '#000000': 'Đen',
        '#ff5733': 'Cam',
        '#0d47a1': 'Xanh dương',
        '#D2B48C': 'Nâu',
        '#D3D3D3': 'Xám nhạt',
        '#F5F5DC': 'Be',
        '#000080': 'Xanh navy',
        '#ADD8E6': 'Xanh nhạt'
    };

    // Read more/less functionality
    const productDetailsCollapse = document.getElementById('productDetailsCollapse');
    const readMoreBtn = document.getElementById('readMoreBtn');

    if (readMoreBtn && productDetailsCollapse) {
        readMoreBtn.addEventListener('click', function () {
            if (productDetailsCollapse.style.maxHeight === '300px' || productDetailsCollapse.style.maxHeight === '' || getComputedStyle(productDetailsCollapse).maxHeight === '300px') {
                productDetailsCollapse.style.maxHeight = '2000px'; // Set a very large value to show all content
                readMoreBtn.textContent = 'THU GỌN';
            } else {
                productDetailsCollapse.style.maxHeight = '300px';
                readMoreBtn.textContent = 'XEM THÊM';
            }
        });
    }

    // Size button selection
    const sizeButtons = document.querySelectorAll('.size-btn');
    const addToCartBtn = document.querySelector('.btn-dark');

    if (sizeButtons.length > 0) {
        sizeButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault(); // Ngăn chặn hành động mặc định

                // Xóa class active từ tất cả các nút
                sizeButtons.forEach(btn => btn.classList.remove('active'));

                // Thêm class active cho nút được click
                this.classList.add('active');

                // Cập nhật nút Thêm vào giỏ hàng nếu có
                if (addToCartBtn) {
                    addToCartBtn.innerHTML = '<i class="bi bi-bag-check me-2"></i>Thêm vào giỏ hàng';
                }
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
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });

        increaseBtn.addEventListener('click', function () {
            let value = parseInt(quantityInput.value) || 1;
            quantityInput.value = value + 1;
        });
    }

    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    const selectedColorText = document.getElementById('selectedColor');

    if (colorOptions.length > 0 && selectedColorText) {
        colorOptions.forEach(option => {
            option.addEventListener('click', function () {
                // Remove selected class from all options
                colorOptions.forEach(opt => opt.classList.remove('selected'));

                // Add selected class to clicked option
                this.classList.add('selected');

                // Update the selected color text
                const colorCode = this.querySelector('.rounded-circle').style.backgroundColor;
                let colorName = 'Màu khác';

                // Lấy tên màu từ data-color hoặc sử dụng map màu
                if (this.dataset.color) {
                    colorName = this.dataset.color;
                } else {
                    // Chuyển đổi RGB hoặc định dạng màu khác thành hex nếu cần
                    for (const [code, name] of Object.entries(colorNameMap)) {
                        if (colorCode.includes(code) || code.includes(colorCode)) {
                            colorName = name;
                            break;
                        }
                    }
                }

                selectedColorText.textContent = colorName;
            });
        });
    }

    // Product thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-preview');
    const productCarousel = document.getElementById('productCarousel');

    if (thumbnails.length > 0 && productCarousel) {
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', function () {
                // Update active state on thumbnails
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                this.classList.add('active');

                // Activate the corresponding carousel item
                try {
                    const bsCarousel = new bootstrap.Carousel(productCarousel);
                    bsCarousel.to(index);
                } catch (error) {
                    console.error('Bootstrap carousel error:', error);

                    // Fallback manual implementation if bootstrap carousel isn't working
                    const carouselItems = productCarousel.querySelectorAll('.carousel-item');
                    carouselItems.forEach((item, i) => {
                        if (i === index) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            });
        });

        // Set first thumbnail as active by default
        thumbnails[0].classList.add('active');

        // Listen for carousel slide events to update thumbnail active state
        if (productCarousel) {
            productCarousel.addEventListener('slid.bs.carousel', function (event) {
                const activeIndex = event.to;

                // Update thumbnail active states
                thumbnails.forEach((thumb, i) => {
                    if (i === activeIndex) {
                        thumb.classList.add('active');
                    } else {
                        thumb.classList.remove('active');
                    }
                });
            });
        }
    }
});

// Add this to your existing product.js file
document.addEventListener('DOMContentLoaded', function () {
    // Size guide modal functionality
    const sizeGuideLinks = document.querySelectorAll('a[href="#"][data-target="size-guide"]');

    // Add click event listeners to all size guide links
    sizeGuideLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sizeGuideModal = new bootstrap.Modal(document.getElementById('sizeGuideModal'));
            sizeGuideModal.show();
        });
    });

    // Size guide modal functionality
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

    // Body type card selection
    const bodyTypeCards = document.querySelectorAll('.body-type-card');

    bodyTypeCards.forEach(card => {
        card.addEventListener('click', function () {
            // Remove selected class from all cards
            bodyTypeCards.forEach(c => c.classList.remove('selected'));

            // Add selected class to clicked card
            this.classList.add('selected');

            // Get body type
            const bodyType = this.dataset.bodyType;
            console.log('Selected body type:', bodyType);

            // Update size recommendation based on height, weight and body type
            recommendSize();
        });
    });

    // Function to recommend size based on height, weight and body type
    // Replace your existing recommendSize function with this:
function recommendSize() {
    if (!heightSlider || !weightSlider) return;

    const height = parseInt(heightSlider.value);
    const weight = parseInt(weightSlider.value);
    const selectedBodyCard = document.querySelector('.body-type-card.selected');
    const bodyType = selectedBodyCard ? selectedBodyCard.dataset.bodyType : 'normal';

    let recommendedSize = '';
    let recommendItems = [];

    // Size chart based on your table data
    if (height >= 150 && height < 160) {
        recommendedSize = 'S';
    } else if (height >= 160 && height < 166) {
        recommendedSize = 'M';
    } else if (height >= 166 && height < 172) {
        recommendedSize = 'L';
    } else if (height >= 172 && height < 178) {
        recommendedSize = 'XL';
    } else if (height >= 178 && height < 184) {
        recommendedSize = '2XL';
    } else if (height >= 184 && height < 189) {
        recommendedSize = '3XL';
    } else if (height >= 189) {
        recommendedSize = '4XL';
    }

    // Adjust for weight
    if (weight >= 48 && weight < 55) {
        // Lower bound of S
    } else if (weight >= 55 && weight < 62) {
        // Lower bound of M
        if (recommendedSize === 'S') recommendedSize = 'M';
    } else if (weight >= 62 && weight < 69) {
        // Lower bound of L
        if (recommendedSize === 'S' || recommendedSize === 'M') recommendedSize = 'L';
    } else if (weight >= 69 && weight < 76) {
        // Lower bound of XL
        if (recommendedSize === 'S' || recommendedSize === 'M' || recommendedSize === 'L') recommendedSize = 'XL';
    } else if (weight >= 76 && weight < 83) {
        // Lower bound of 2XL
        if (recommendedSize === 'S' || recommendedSize === 'M' || recommendedSize === 'L' || recommendedSize === 'XL') recommendedSize = '2XL';
    } else if (weight >= 83 && weight < 88) {
        // Lower bound of 3XL
        if (recommendedSize === 'S' || recommendedSize === 'M' || recommendedSize === 'L' || recommendedSize === 'XL' || recommendedSize === '2XL') recommendedSize = '3XL';
    } else if (weight >= 88) {
        // Lower bound of 4XL
        recommendedSize = '4XL';
    }

    // Adjust based on body type
    if (bodyType === 'slim' && recommendedSize !== 'S') {
        // For slim body type, might want to go down a size
        const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
        const currentIndex = sizes.indexOf(recommendedSize);
        if (currentIndex > 0) {
            recommendedSize = sizes[currentIndex - 1];
        }
    } else if (bodyType === 'heavy' && recommendedSize !== '4XL') {
        // For heavy body type, might want to go up a size
        const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
        const currentIndex = sizes.indexOf(recommendedSize);
        if (currentIndex < sizes.length - 1) {
            recommendedSize = sizes[currentIndex + 1];
        }
    }

    // Add specific recommendations based on the selection (mimicking your screenshot)
    recommendItems.push(`${recommendedSize} - Áo`);
    
    // Display the recommendations
    displayRecommendations(recommendItems);
    
    // Highlight the recommended size button in the product page
    highlightRecommendedSize(recommendedSize);
}

// Add this new function to display recommendations like in your screenshot
function displayRecommendations(items) {
    // Remove any existing recommendation container
    const existingRecommend = document.querySelector('.coolmate-recommend');
    if (existingRecommend) {
        existingRecommend.remove();
    }
    
    // Create recommendation container
    const recommendContainer = document.createElement('div');
    recommendContainer.className = 'coolmate-recommend mt-3';
    recommendContainer.innerHTML = `
        <p class="mb-2">Coolmate gợi ý bạn:</p>
        <div class="d-flex flex-wrap">
            ${items.map(item => `
                <button class="btn btn-dark rounded-pill me-2 mb-2 px-3">${item}</button>
            `).join('')}
        </div>
    `;
    
    // Insert the recommendation after the body type cards
    const bodyTypeContainer = document.querySelector('.body-type-card').closest('.row');
    if (bodyTypeContainer) {
        bodyTypeContainer.after(recommendContainer);
    }
}
});
