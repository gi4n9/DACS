// public/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Main script loaded"); // Debug

  // Slick Carousel
  try {
    $(".product-slider").slick({
      slidesToShow: 5,
      slidesToScroll: 5,
      arrows: true,
      prevArrow: $(".slick-prev"),
      nextArrow: $(".slick-next"),
      infinite: false,
    });
    console.log("Slick initialized");
  } catch (error) {
    console.error("Slick error:", error);
  }

  // Swiper
  try {
    var swiper = new Swiper(".homepage-product-swiper", {
      slidesPerView: 6,
      spaceBetween: 30,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 4 },
        1200: { slidesPerView: 6 },
      },
    });
    console.log("Swiper initialized");
  } catch (error) {
    console.error("Swiper error:", error);
  }

  // Categories Section
  try {
    const container = document.querySelector(".categories-container");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (!container || !prevBtn || !nextBtn) {
      throw new Error("Không tìm thấy các element cần thiết cho categories");
    }

    const scrollAmount = 300;
    const scrollDuration = 500;

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

      function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }

    prevBtn.addEventListener("click", () => {
      const target = Math.max(container.scrollLeft - scrollAmount, 0);
      smoothScroll(target, scrollDuration);
      console.log("Prev clicked");
    });

    nextBtn.addEventListener("click", () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const target = Math.min(container.scrollLeft + scrollAmount, maxScroll);
      smoothScroll(target, scrollDuration);
      console.log("Next clicked");
    });

    const items = document.querySelectorAll(".category-item");
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("animate");
      }, index * 100);
    });

    console.log("Categories script initialized");
  } catch (error) {
    console.error("Categories error:", error);
  }
});
