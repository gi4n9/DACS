import { useState, useMemo } from "react"; // 1. Import hooks
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  // 2. State để quản lý ảnh hiển thị
  const [currentImage, setCurrentImage] = useState(product.image);

  if (!product || !product.product_id || !product.price) {
    console.warn("ProductCard: Invalid product data", product);
    return null;
  }

  // === 3. Lọc các màu sắc duy nhất ===
  // Dùng useMemo để tối ưu, chỉ chạy lại khi variants thay đổi
  const uniqueColors = useMemo(() => {
    const colorMap = new Map();
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant) => {
        // Nếu chưa có màu này, thêm vào Map
        if (variant.color_name && !colorMap.has(variant.color_name)) {
          // Ưu tiên ảnh của variant, nếu không có thì fallback về ảnh chính
          colorMap.set(variant.color_name, variant.image || product.image);
        }
      });
    }
    // Chuyển Map thành mảng [{ color_name, image }]
    return Array.from(colorMap.entries()).map(([color_name, image]) => ({
      color_name,
      image,
    }));
  }, [product.variants, product.image]); // Phụ thuộc vào variants VÀ ảnh chính

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

  // 4. Hàm xử lý sự kiện hover
  const handleMouseLeave = () => {
    setCurrentImage(product.image); // Reset về ảnh chính
  };

  const handleSwatchHover = (image) => {
    setCurrentImage(image); // Đổi ảnh chính
  };

  const cardContent = (
    <Card className="rounded-xl border hover:shadow-md transition overflow-hidden cursor-pointer h-full flex flex-col">
      {/* - Thêm 'group' ở đây
        - Xóa 'group' ở Link bên dưới
      */}
      <div className="relative group">
        <img
          // 5. Dùng state `currentImage`
          src={currentImage || "/placeholder.jpg"}
          alt={product.name || "Sản phẩm"}
          className={`w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 ${
            isSoldOut ? "grayscale" : ""
          }`}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x400";
          }}
        />

        {/* Overlay Hết hàng (Giữ nguyên) */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-black font-bold text-lg px-4 py-2 border border-black rounded-md">
              HẾT HÀNG
            </span>
          </div>
        )}

        {/* % giảm giá (Giữ nguyên) */}
        {discountPercentage > 0 && !isSoldOut && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{discountPercentage}%
          </Badge>
        )}

        {/* Nút yêu thích (Giữ nguyên) */}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100">
          <Heart size={18} />
        </button>

        {/* --- 6. PHẦN HIỂN THỊ VARIANT MỚI --- */}
        {/* - Chỉ hiện khi không hết hàng VÀ có nhiều hơn 1 màu 
          - Ẩn (opacity-0), chỉ hiện khi hover (group-hover:opacity-100)
        */}
        {!isSoldOut && uniqueColors.length > 1 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/20 to-transparent
                       flex justify-center items-end gap-2 p-2 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {/* Giới hạn 5 màu */}
            {uniqueColors.slice(0, 5).map((color) => (
              <button
                key={color.color_name}
                className="w-7 h-7 rounded-full border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                // Đổi ảnh khi hover vào nút
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
            {/* Hiển thị +... nếu nhiều hơn 5 màu */}
            {uniqueColors.length > 5 && (
              <div className="w-7 h-7 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center text-xs font-bold">
                +{uniqueColors.length - 5}
              </div>
            )}
          </div>
        )}
        {/* --- KẾT THÚC PHẦN MỚI --- */}
      </div>

      <CardContent className="p-4 text-center flex-1 flex flex-col justify-between">
        {/* Phần trên (Tên, Giá) (Giữ nguyên) */}
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
        </div>

        {/* Phần dưới (Hiển thị tồn kho) (Giữ nguyên) */}
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
      // 7. Thêm onMouseLeave vào đây
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
