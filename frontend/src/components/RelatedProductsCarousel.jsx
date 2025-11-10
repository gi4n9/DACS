// src/components/RelatedProductsCarousel.jsx

import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RelatedProductsCarousel({ products }) {
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerFrame = 4;

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

  const isPrevDisabled = currentPage === 0;
  const isNextDisabled = currentPage >= totalPages - 1;

  if (!products || products.length === 0) {
    return null;
  }

  return (
    // --- THAY ĐỔI: Xóa class "group" vì không cần hover nữa ---
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 w-full grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {page.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- CẬP NHẬT NÚT PREV --- */}
      {/* (Xóa: opacity-0 group-hover:opacity-100) */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md 
                   transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
        onClick={handlePrev}
        disabled={isPrevDisabled}
      >
        <ChevronLeft size={20} />
      </Button>

      {/* --- CẬP NHẬT NÚT NEXT --- */}
      {/* (Xóa: opacity-0 group-hover:opacity-100) */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md 
                   transition-opacity disabled:opacity-0 disabled:cursor-not-allowed"
        onClick={handleNext}
        disabled={isNextDisabled}
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}
