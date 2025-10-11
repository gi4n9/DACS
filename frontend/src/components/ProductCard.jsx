import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  if (!product || !product.product_id || !product.price) {
    console.warn("ProductCard: Invalid product data", product);
    return null;
  }

  return (
    <Link to={`/product/${product.product_id}`}>
      <Card className="rounded-xl border hover:shadow-md transition overflow-hidden cursor-pointer">
        <div className="relative group">
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name || "Sản phẩm"}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {product.discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{product.discount}%
            </Badge>
          )}

          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100">
            <Heart size={18} />
          </button>
        </div>

        <CardContent className="p-4 text-center">
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

            {product.origin_price && product.origin_price > product.price && (
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
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductCard;
