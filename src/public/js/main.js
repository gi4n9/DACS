document.addEventListener("DOMContentLoaded", () => {
  console.log("Main script loaded");

  // Hàm khởi tạo cuộn mượt mà cho container
  function initSmoothScroll(container, prevBtn, nextBtn, itemWidth = 282) {
    if (!container || !prevBtn || !nextBtn) {
      console.error("Không tìm thấy container, prevBtn hoặc nextBtn");
      return;
    }

    const gap = 20; // Khoảng cách giữa các phần tử (gap trong CSS)
    const scrollAmount = itemWidth + gap; // Tổng khoảng cách cuộn mỗi lần
    const scrollDuration = 500; // Thời gian cuộn (ms)

    function smoothScroll(target, duration) {
      const start = container.scrollLeft;
      const distance = target - start;
      let startTime = null;

      function animation(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, start, distance, duration);
        container.scrollLeft = run;
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      // Hàm easing để chuyển động mượt mà
      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }

    // Sự kiện nhấn nút Previous
    prevBtn.addEventListener("click", () => {
      const target = Math.max(container.scrollLeft - scrollAmount * 4, 0); // Cuộn trái 4 mục
      smoothScroll(target, scrollDuration);
      console.log(`Scrolled left in ${container.className}`);
    });

    // Sự kiện nhấn nút Next
    nextBtn.addEventListener("click", () => {
      const maxScroll = container.scrollWidth - container.clientWidth; // Giới hạn cuộn bên phải
      const target = Math.min(
        container.scrollLeft + scrollAmount * 4,
        maxScroll
      ); // Cuộn phải 4 mục
      smoothScroll(target, scrollDuration);
      console.log(`Scrolled right in ${container.className}`);
    });

    // Hiệu ứng animation cho các item
    const items = container.querySelectorAll(".animate");
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("animate-active");
      }, index * 100); // Mỗi item xuất hiện cách nhau 100ms
    });
  }

  // Khởi tạo cho homepage-product (6 phần tử, width 282px)
  const productContainer = document.querySelector(".products-container");
  const productWrapper = document.querySelector(".products-wrapper");
  if (productContainer && productWrapper) {
    const productPrevBtn = productWrapper.querySelector(".prev-btn");
    const productNextBtn = productWrapper.querySelector(".next-btn");
    initSmoothScroll(productContainer, productPrevBtn, productNextBtn, 282);
  } else {
    console.warn("Không tìm thấy .products-container hoặc .products-wrapper");
  }

  // Khởi tạo cho tất cả categories-section (4 phần tử, width 440px)
  const categoryContainers = document.querySelectorAll(".categories-container");
  categoryContainers.forEach((container) => {
    const wrapper = container.closest(".categories-wrapper");
    if (wrapper) {
      const prevBtn = wrapper.querySelector(".prev-btn");
      const nextBtn = wrapper.querySelector(".next-btn");
      initSmoothScroll(container, prevBtn, nextBtn, 440);
    } else {
      console.warn(
        "Không tìm thấy .categories-wrapper chứa .categories-container"
      );
    }
  });
});
