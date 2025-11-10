import React from "react";
import { useWishlist } from "@/context/WishlistContext";
import ProductGrid from "@/components/ProductGrid";

export default function WishlistPage() {
  const { wishlistProducts, loadingWishlist } = useWishlist();

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Sản phẩm ưa thích</h2>

      {loadingWishlist ? (
        <p>Đang tải...</p>
      ) : (
        <ProductGrid products={wishlistProducts} />
      )}
    </div>
  );
}
