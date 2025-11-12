// src/components/ProductCarousel.jsx

import React, { useState } from "react";
import ProductCard from "./ProductCard"; // Import ProductCard
import { Link } from "react-router-dom"; // Import Link
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Hiển thị một carousel sản phẩm (4 sản phẩm/trang)
 * @param {string} title - Tiêu đề của mục (ví dụ: "Áo Thun Nam")
 * @param {array} products - Mảng các sản phẩm
 * @param {string} viewMoreLink - Đường dẫn slug (ví dụ: "/ao-thun-nam")
 */
export default function ProductCarousel({ title, products, viewMoreLink }) {
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerFrame = 4; // 4 sản phẩm 1 frame như anh yêu cầu

  // Chia mảng sản phẩm thành các "trang", mỗi trang 4 sản phẩm
  const pages = [];
  if (products && Array.isArray(products)) {
    for (let i = 0; i < products.length; i += productsPerFrame) {
      pages.push(products.slice(i, i + productsPerFrame));
    }
  }
  const totalPages = pages.length;

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  // Vô hiệu hóa nút nếu ở trang đầu/cuối
  const isPrevDisabled = currentPage === 0;
  const isNextDisabled = currentPage >= totalPages - 1;

  if (!products || products.length === 0) {
    return null; // Không render gì nếu không có sản phẩm
  }

  return (
    <section className="relative w-full">
      {/* Header: Tiêu đề và nút Xem thêm */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-3xl font-bold">{title}</h2>
        {viewMoreLink && (
          <Button asChild variant="link" className="text-blue-600">
            <Link to={viewMoreLink}>Xem thêm &rarr;</Link>
          </Button>
        )}
      </div>

      {/* Viewport: Vùng chứa có thể nhìn thấy */}
      <div className="overflow-hidden relative">
        {/* Track: Dải slide chứa tất cả các trang */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {/* Render từng trang (mỗi trang là 1 frame 100%) */}
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 w-full grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {/* Render 4 sản phẩm trong trang đó */}
              {page.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Nút Previous (chỉ hiển thị nếu không bị disabled) */}
      {!isPrevDisabled && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md disabled:opacity-0 disabled:cursor-not-allowed"
          onClick={handlePrev}
          disabled={isPrevDisabled}
        >
          <ChevronLeft size={20} />
        </Button>
      )}

      {/* Nút Next (chỉ hiển thị nếu không bị disabled) */}
      {!isNextDisabled && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md disabled:opacity-0 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={isNextDisabled}
        >
          <ChevronRight size={20} />
        </Button>
      )}
    </section>
  );
}
