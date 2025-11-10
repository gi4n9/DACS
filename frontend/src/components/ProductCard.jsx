import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, StarHalf } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext"; // 1. Import hook

function ProductCard({ product }) {
  // --- 2. THAY ĐỔI: Nhận `wishlist` (Set) thay vì `isLiked` ---
  const { wishlist, toggleWishlist, loadingWishlist } = useWishlist();

  const [currentImage, setCurrentImage] = useState(product.image);

  if (!product || !product.product_id || !product.price) {
    console.warn("ProductCard: Invalid product data", product);
    return null;
  }

  // --- 3. THAY ĐỔI: Kiểm tra 'like' trực tiếp từ state ---
  const liked = wishlist.has(product.product_id);

  // Lọc màu sắc (Giữ nguyên)
  const uniqueColors = useMemo(() => {
    const colorMap = new Map();
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        if (variant.color_name && !colorMap.has(variant.color_name)) {
          colorMap.set(variant.color_name, variant.image || product.image);
        }
      });
    }
    return Array.from(colorMap.entries()).map(([color_name, image]) => ({
      color_name,
      image,
    }));
  }, [product.variants, product.image]);

  // Logic hết hàng (Giữ nguyên)
  const isSoldOut = product.stock === 0;

  // Logic % giảm giá (Giữ nguyên)
  let discountPercentage = 0;
  if (
    product.origin_price &&
    product.price &&
    product.origin_price > product.price
  ) {
    discountPercentage = Math.round(
      ((product.origin_price - product.price) / product.origin_price) * 100
    );
  }

  // Hàm xử lý hover (Giữ nguyên)
  const handleMouseLeave = () => {
    setCurrentImage(product.image);
  };
  const handleSwatchHover = (image) => {
    setCurrentImage(image);
  };

  // 4. Hàm xử lý click nút Heart (Giữ nguyên)
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.product_id);
  };

  const cardContent = (
    <Card className="rounded-xl border hover:shadow-md transition overflow-hidden cursor-pointer h-full flex flex-col">
      <div className="relative group">
        <img
          src={currentImage || "/placeholder.jpg"}
          alt={product.name || "Sản phẩm"}
          className={`w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 ${
            isSoldOut ? "grayscale" : ""
          }`}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x400";
          }}
        />

        {isSoldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-black font-bold text-lg px-4 py-2 border border-black rounded-md">
              HẾT HÀNG
            </span>
          </div>
        )}
        {discountPercentage > 0 && !isSoldOut && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{discountPercentage}%
          </Badge>
        )}

        {/* --- 5. SỬA LỖI TYPO --- */}
        <button
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
          onClick={handleToggleWishlist}
          disabled={loadingWishlist} // <-- SỬA LỖI: (từ wishlistLoading -> loadingWishlist)
        >
          <Heart
            size={18}
            fill={liked ? "red" : "none"} // <-- Sẽ tự động cập nhật khi 'liked' thay đổi
            className={liked ? "text-red-500" : "text-gray-600"}
          />
        </button>
        {/* --- KẾT THÚC SỬA LỖI --- */}

        {!isSoldOut && uniqueColors.length > 1 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/20 to-transparent
                       flex justify-center items-end gap-2 p-2 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {uniqueColors.slice(0, 5).map((color) => (
              <button
                key={color.color_name}
                className="w-7 h-7 rounded-full border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onMouseEnter={() => handleSwatchHover(color.image)}
              >
                <img
                  src={color.image}
                  alt={color.color_name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.backgroundColor = "#eee";
                    e.target.src = "";
                  }}
                />
              </button>
            ))}
            {uniqueColors.length > 5 && (
              <div className="w-7 h-7 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center text-xs font-bold">
                +{uniqueColors.length - 5}
              </div>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-medium line-clamp-2">
            {product.name || "Không có tên"}
          </h3>

          <div className="mt-2 flex justify-center items-center gap-2">
            <span className="text-lg font-bold text-primary">
              {Number.isFinite(product.price)
                ? product.price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                : "N/A"}
            </span>

            {discountPercentage > 0 && (
              <span className="text-gray-500 line-through text-sm">
                {Number.isFinite(product.origin_price)
                  ? product.origin_price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })
                  : "N/A"}
              </span>
            )}
          </div>

          {product.ratingCount > 0 && (
            <div className="mt-2 flex items-center justify-center text-xs text-gray-500">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => {
                  const roundedRating = Math.round(product.ratingAvg * 2) / 2;
                  const ratingValue = i + 1;
                  if (roundedRating >= ratingValue) {
                    return (
                      <Star
                        key={i}
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    );
                  } else if (roundedRating >= ratingValue - 0.5) {
                    return (
                      <StarHalf
                        key={i}
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    );
                  } else {
                    return (
                      <Star
                        key={i}
                        size={14}
                        className="text-gray-300"
                        fill="none"
                      />
                    );
                  }
                })}
              </div>
              <span className="ml-1">({product.ratingAvg.toFixed(1)})</span>
              <span className="ml-1">| ({product.ratingCount})</span>
            </div>
          )}
        </div>

        <div className="mt-2 min-h-[26px]">
          {!isSoldOut && (
            <p className="text-sm text-gray-600">Số lượng: {product.stock}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link
      to={isSoldOut ? "#" : `/product/${product.product_id}`}
      onMouseLeave={handleMouseLeave}
      className={isSoldOut ? "pointer-events-none" : ""}
      aria-disabled={isSoldOut}
      tabIndex={isSoldOut ? -1 : undefined}
    >
      {cardContent}
    </Link>
  );
}

export default ProductCard;
