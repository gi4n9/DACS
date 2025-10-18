import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  if (!product || !product.product_id || !product.price) {
    console.warn("ProductCard: Invalid product data", product);
    return null;
  }

  // === THAY ĐỔI LOGIC: Chỉ cần biết hết hàng hay không ===
  const isSoldOut = product.stock === 0;

  // === LOGIC TÍNH % GIẢM GIÁ (Giữ nguyên) ===
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

  const cardContent = (
    <Card className="rounded-xl border hover:shadow-md transition overflow-hidden cursor-pointer h-full flex flex-col">
      <div className="relative group">
        <img
          src={product.image || "/placeholder.jpg"}
          alt={product.name || "Sản phẩm"}
          className={`w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 ${
            isSoldOut ? "grayscale" : "" // Áp dụng grayscale nếu hết hàng
          }`}
        />

        {/* === Overlay Hết hàng (Giữ nguyên) === */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-black font-bold text-lg px-4 py-2 border border-black rounded-md">
              HẾT HÀNG
            </span>
          </div>
        )}

        {/* === Hiển thị % giảm giá (Giữ nguyên) === */}
        {discountPercentage > 0 && !isSoldOut && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{discountPercentage}%
          </Badge>
        )}

        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100">
          <Heart size={18} />
        </button>
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

        {/* Phần dưới (Hiển thị tồn kho) */}
        <div className="mt-2 min-h-[26px]">
          {/* === THAY ĐỔI: Hiển thị stock (nếu không hết hàng) === */}
          {!isSoldOut && (
            <p className="text-sm text-gray-600">Số lượng: {product.stock}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // === Logic Link (Giữ nguyên) ===
  return (
    <Link
      to={isSoldOut ? "#" : `/product/${product.product_id}`}
      className={isSoldOut ? "pointer-events-none" : ""}
      aria-disabled={isSoldOut}
      tabIndex={isSoldOut ? -1 : undefined}
    >
      {cardContent}
    </Link>
  );
}

export default ProductCard;
