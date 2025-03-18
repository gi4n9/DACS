document.addEventListener("DOMContentLoaded", () => {
  console.log("Main script loaded");

  // Hàm khởi tạo cuộn mượt mà cho container
  function initSmoothScroll(
    containerSelector,
    prevBtnSelector,
    nextBtnSelector,
    itemWidth = 282
  ) {
    const container = document.querySelector(containerSelector);
    const prevBtn = document.querySelector(prevBtnSelector);
    const nextBtn = document.querySelector(nextBtnSelector);

    if (!container || !prevBtn || !nextBtn) {
      console.error(
        `Không tìm thấy các element: ${containerSelector}, ${prevBtnSelector}, ${nextBtnSelector}`
      );
      return;
    }

    const gap = 20; // Khoảng cách giữa các phần tử (gap trong CSS)
    const scrollAmount = itemWidth + gap; // Tổng khoảng cách cuộn mỗi lần (chiều rộng phần tử + gap)
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
      const target = Math.max(container.scrollLeft - scrollAmount, 0); // Không cuộn quá bên trái
      smoothScroll(target, scrollDuration);
      console.log(`Scrolled left in ${containerSelector}`);
    });

    // Sự kiện nhấn nút Next
    nextBtn.addEventListener("click", () => {
      const maxScroll = container.scrollWidth - container.clientWidth; // Giới hạn cuộn bên phải
      const target = Math.min(container.scrollLeft + scrollAmount, maxScroll);
      smoothScroll(target, scrollDuration);
      console.log(`Scrolled right in ${containerSelector}`);
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
  initSmoothScroll(
    ".products-container",
    ".products-wrapper .prev-btn",
    ".products-wrapper .next-btn",
    282
  );

  // Khởi tạo cho categories-section (giả sử mỗi category-item cũng rộng 282px, có thể điều chỉnh)
  initSmoothScroll(
    ".categories-container",
    ".categories-wrapper .prev-btn",
    ".categories-wrapper .next-btn",
    282
  );
});
