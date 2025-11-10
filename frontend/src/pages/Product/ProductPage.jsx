import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SizeGuideDialog from "@/components/SizeGuideDialog";
import ProductTabs from "@/components/ProductTabs";
import RelatedProductsCarousel from "@/components/RelatedProductsCarousel";
import { getProductById, getProductsByCategorySlug } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  Star,
  Share2,
  Truck,
  StarHalf,
  RotateCcw,
  BadgeCent,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductReviews from "@/components/ProductReviews";

// Hàm lấy token từ cookie (Giữ nguyên)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function ProductPage({ user, openAuth }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  // Hàm nhóm variants theo màu (Giữ nguyên)
  const groupVariantsByColor = useCallback((variants = []) => {
    const map = {};
    variants.forEach((v) => {
      if (!map[v.color_name]) {
        map[v.color_name] = {
          color_name: v.color_name,
          color_image: v.image,
          color_hex: v.color_hex,
        };
      }
    });
    return Object.values(map);
  }, []);

  // useEffect load data (Giữ nguyên)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setRelated([]);

        const res = await getProductById(id);
        const data = res.data.product;
        const categorySlug = res.data.category?.[0]?.slug;

        let images = [];
        if (Array.isArray(data.images)) {
          images = data.images;
        } else if (typeof data.images === "string") {
          try {
            const parsed = JSON.parse(data.images);
            images = Array.isArray(parsed) ? parsed : [data.images];
          } catch {
            images = [data.images];
          }
        } else if (data.image) {
          images = [data.image];
        }

        let uniqueVariants = [];
        if (data.variants && data.variants.length > 0) {
          uniqueVariants = Array.from(
            new Map(data.variants.map((v) => [v.sku, v])).values()
          );
        }

        const productData = { ...data, images, variants: uniqueVariants };
        setProduct(productData);

        if (uniqueVariants.length > 0) {
          const firstColor = groupVariantsByColor(uniqueVariants)[0];
          setSelectedColor(firstColor || null);
          setMainImage(firstColor?.color_image || images[0] || "");
        } else {
          setMainImage(images[0] || "");
        }

        if (categorySlug && data.price) {
          // 2. Tạo bộ lọc giá "thông minh"
          const priceMargin = 150000; // Chênh lệch 150.000đ như anh gợi ý
          const currentPrice = data.price;

          // Đảm bảo minPrice không bị âm (ví dụ: đặt sàn là 100.000đ)
          const minPrice = Math.max(100000, currentPrice - priceMargin);
          const maxPrice = currentPrice + priceMargin;

          const smartFilters = {
            minPrice: minPrice,
            maxPrice: maxPrice,
          };
          // --- KẾT THÚC BƯỚC 2 ---

          // 3. Gọi API với bộ lọc giá mới
          const relatedRes = await getProductsByCategorySlug(
            categorySlug,
            1,
            21, // Lấy 20 sản phẩm
            smartFilters // <-- SỬ DỤNG BỘ LỌC MỚI
          );

          if (relatedRes.status && relatedRes.data.products) {
            // Lọc sản phẩm hiện tại ra khỏi danh sách liên quan
            const relatedProds = relatedRes.data.products.filter(
              (p) => p.product_id !== data.product_id
            );
            setRelated(Array.isArray(relatedProds) ? relatedProds : []);
          }
        } else {
          console.warn(
            "Sản phẩm thiếu 'category_slug' hoặc 'price', không thể lấy gợi ý thông minh."
          );
        }
      } catch (err) {
        console.error("Lỗi khi load sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, groupVariantsByColor]);

  // Hàm hiệu ứng fly-to-cart (Giữ nguyên)
  function animateFlyToCart(imageSrc) {
    const cartIcon = document.querySelector("a[href='/cart']");
    if (!cartIcon) return;
    const img = document.createElement("img");
    img.src = imageSrc;
    img.className =
      "fixed w-20 h-20 object-cover rounded-full z-[9999] pointer-events-none transition-all duration-700 ease-in-out";
    const mainImageElement = document.querySelector(".main-product-image");
    const startRect = mainImageElement?.getBoundingClientRect() || {
      top: 200,
      left: 200,
    };
    img.style.top = `${startRect.top}px`;
    img.style.left = `${startRect.left}px`;
    document.body.appendChild(img);
    const rect = cartIcon.getBoundingClientRect();
    setTimeout(() => {
      img.style.top = `${rect.top}px`;
      img.style.left = `${rect.left}px`;
      img.style.width = "0px";
      img.style.height = "0px";
      img.style.opacity = "0.5";
    }, 50);
    setTimeout(() => img.remove(), 800);
  }

  // Hàm xử lý khi chọn màu (Giữ nguyên)
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setMainImage(color.color_image || product.images[0]);
    setSelectedSize("");
    setQuantity(1);
  };

  // Hàm xử lý khi thay đổi số lượng (Giữ nguyên)
  const handleQuantityChange = (type) => {
    setQuantity((prev) => {
      if (type === "increment") return prev + 1;
      if (type === "decrement" && prev > 1) return prev - 1;
      return prev;
    });
  };

  if (loading)
    return <p className="text-center py-10 mt-[150px]">Đang tải sản phẩm...</p>;
  if (!product)
    return (
      <p className="text-center py-10 mt-[150px]">Không tìm thấy sản phẩm</p>
    );

  // Lấy variant được chọn hiện tại (Giữ nguyên)
  const currentSelectedVariant = product.variants.find(
    (v) =>
      v.color_name === selectedColor?.color_name && v.size_name === selectedSize
  );
  // Cập nhật maxQuantity để dùng cho nút Plus
  const maxQuantity = currentSelectedVariant ? currentSelectedVariant.stock : 1;

  return (
    <div className="w-full flex justify-center mt-[150px] mb-10">
      <div className="w-full max-w-[1200px] px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Chỉ có ảnh chính (Giữ nguyên) */}
          <div className="flex justify-center items-start">
            <div className="w-full max-w-[500px] overflow-hidden rounded-xl border">
              <img
                src={mainImage || "https://via.placeholder.com/600x800"}
                alt={product.name}
                className="w-full h-auto object-cover main-product-image"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x800";
                }}
              />
            </div>
          </div>
          {/* Right: Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {product.ratingCount > 0 ? (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  {/* Hiển thị số Avg */}
                  <span className="mr-1 font-bold text-orange-400">
                    {product.ratingAvg.toFixed(1)}
                  </span>
                  {/* Hiển thị sao (logic từ ProductCard) */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => {
                      const roundedRating =
                        Math.round(product.ratingAvg * 2) / 2;
                      const ratingValue = i + 1;
                      if (roundedRating >= ratingValue) {
                        return (
                          <Star
                            key={i}
                            size={16}
                            className="text-orange-400 fill-orange-400"
                          />
                        );
                      } else if (roundedRating >= ratingValue - 0.5) {
                        return (
                          <StarHalf
                            key={i}
                            size={16}
                            className="text-orange-400 fill-orange-400"
                          />
                        );
                      } else {
                        return (
                          <Star
                            key={i}
                            size={16}
                            className="text-gray-300"
                            fill="none"
                          />
                        );
                      }
                    })}
                  </div>
                  {/* Hiển thị số lượng đánh giá */}
                  <span className="ml-1">({product.ratingCount})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:text-black"
                >
                  <Share2 size={16} className="mr-1" />
                  Chia sẻ
                </Button>
              </div>
            ) : (
              // (Nếu không có rating, có thể hiện nút Share)
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:text-black"
                >
                  <Share2 size={16} className="mr-1" />
                  Chia sẻ
                </Button>
              </div>
            )}

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-black">
                {product.price.toLocaleString()}đ
              </span>
              {/* Hiển thị giá gốc nếu có */}
              {product.origin_price && product.origin_price > product.price && (
                <span className="text-gray-500 line-through text-lg">
                  {product.origin_price.toLocaleString()}đ
                </span>
              )}
              {/* Hiển thị % giảm giá (lấy từ trường 'discount' trong JSON) */}
              {product.discount && product.discount > 0 && (
                <Badge className="bg-red-500 text-white text-base">
                  -{product.discount}%
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md border w-fit">
              <Truck size={18} className="text-green-600" />
              <span>Sản phẩm này mất phí vận chuyển</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <BadgeCent size={18} className="text-blue-600" />
                <span className="font-medium">HOT - Mua 2 giảm thêm 10%</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BadgeCent size={18} className="text-blue-600" />
                <span className="font-medium">Mã giảm giá</span>
                <span className="text-blue-600 font-bold ml-1">Giảm 50K</span>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger className="flex items-center justify-between text-blue-600 font-medium hover:no-underline p-0">
                    <div className="flex items-center gap-2">
                      <BadgeCent size={18} className="text-blue-600" />
                      <span>Được hoàn 3.000 CoolCash</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pl-8 pt-2">
                    CoolCash là điểm thưởng, có thể dùng để giảm giá cho các đơn
                    hàng sau.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Colors (Giữ nguyên) */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-medium mb-2 text-sm">
                  Màu sắc:{" "}
                  <span className="font-bold">{selectedColor?.color_name}</span>
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {groupVariantsByColor(product.variants).map((color) => (
                    <Button
                      key={color.color_name}
                      variant="outline"
                      className={`w-10 h-10 rounded-full p-0 border-2 overflow-hidden relative
                        ${
                          selectedColor?.color_name === color.color_name
                            ? "border-black ring-2 ring-blue-500"
                            : "border-gray-300"
                        }`}
                      onClick={() => handleColorSelect(color)}
                      title={color.color_name}
                      style={{
                        backgroundColor: color.color_hex || "#eee",
                      }}
                    >
                      {color.color_image && (
                        <img
                          src={color.color_image}
                          alt={color.color_name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.backgroundColor =
                              color.color_hex || "#eee";
                            e.target.src = "";
                          }}
                        />
                      )}
                      {!color.color_image && (
                        <span className="sr-only">{color.color_name}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes (Giữ nguyên) */}
            {selectedColor && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Kích thước:</h3>
                  <SizeGuideDialog />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.variants
                    .filter((v) => v.color_name === selectedColor.color_name)
                    .map((v) => {
                      // Logic hiển thị stock
                      const lowStockThreshold = 10;
                      let stockDisplay = "";
                      if (v.stock === 0) {
                        stockDisplay = " (Hết)";
                      } else if (v.stock > 0 && v.stock <= lowStockThreshold) {
                        stockDisplay = ` (Còn ${v.stock})`;
                      }

                      return (
                        <Button
                          key={v.sku}
                          variant={
                            selectedSize === v.size_name ? "default" : "outline"
                          }
                          onClick={() => setSelectedSize(v.size_name)}
                          disabled={v.stock === 0}
                          className={`min-w-[40px] px-3 py-2 rounded-md h-auto
                                      flex flex-col items-center justify-center
                                      ${
                                        v.stock === 0
                                          ? "line-through opacity-60"
                                          : ""
                                      }`}
                        >
                          <span className="text-base font-medium">
                            {v.size_name}
                          </span>
                          {stockDisplay && (
                            <span className="text-xs font-normal opacity-80">
                              {stockDisplay}
                            </span>
                          )}
                        </Button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quantity and Add to cart (Giữ nguyên) */}
            <div className="flex items-center gap-4 border-t border-b py-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange("decrement")}
                  disabled={quantity <= 1}
                  className="rounded-r-none"
                >
                  <Minus size={16} />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange("increment")}
                  disabled={quantity >= maxQuantity}
                  className="rounded-l-none"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 bg-black text-white hover:bg-gray-800"
                disabled={
                  !selectedSize ||
                  !selectedColor ||
                  quantity > maxQuantity ||
                  maxQuantity === 0
                }
                onClick={async () => {
                  const token = getCookie("token");

                  if (!token || !user?.user_id) {
                    toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                    if (typeof openAuth === "function") {
                      openAuth();
                    }
                    return;
                  }

                  try {
                    if (!selectedSize || !selectedColor) {
                      toast.error("Vui lòng chọn màu và kích thước!");
                      return;
                    }

                    const chosenVariant = product.variants.find(
                      (v) =>
                        v.color_name === selectedColor.color_name &&
                        v.size_name === selectedSize
                    );

                    if (!chosenVariant) {
                      toast.error("Không tìm thấy biến thể phù hợp!");
                      return;
                    }

                    if (
                      chosenVariant.stock === 0 ||
                      quantity > chosenVariant.stock
                    ) {
                      toast.error(
                        `Sản phẩm này chỉ còn ${chosenVariant.stock} sản phẩm!`
                      );
                      return;
                    }

                    const productItem = {
                      product_id: product.product_id,
                      variant_id: chosenVariant.sku,
                      name: product.name,
                      color: selectedColor.color_name,
                      size: selectedSize,
                      price: chosenVariant.price || product.price,
                      qty: quantity,
                      image: mainImage || product.images[0],
                    };

                    const success = await addToCart(productItem, user, token);
                    if (success) {
                      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
                      animateFlyToCart(mainImage || product.images[0]);
                    }
                  } catch (err) {
                    console.error("Lỗi logic khi thêm vào giỏ hàng:", err);
                    toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
                  }
                }}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>

            {/* Tiện ích / Cam kết (Giữ nguyên) */}
            <div className="grid grid-cols-2 gap-4 text-sm mt-6">
              <div className="flex items-center gap-2">
                <RotateCcw size={20} className="text-gray-600" />
                <span>60 ngày đổi trả vì bất kỳ lý do gì</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-gray-600" />
                <span>
                  Hotline 0900.222.257 <br /> hỗ trợ từ 8h30 - 22h
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCent size={20} className="text-gray-600" />
                <span>
                  Đảm nhận mọi rủi ro hàng hoá,
                  <br /> hoàn tiền trong 24h
                </span>
              </div>
            </div>
          </div>{" "}
          {/* End Right: Info */}
        </div>{" "}
        {/* End grid cols-2 */}
        {/* Product Description Tabs (Giữ nguyên) */}
        <div className="mt-16">
          <ProductTabs description={product.description} />
        </div>
        {/* --- PHẦN ĐÁNH GIÁ (ĐÃ THÊM) --- */}
        <div className="mt-16">
          <ProductReviews
            productId={product.product_id}
            ratingAvg={product.ratingAvg}
            ratingCount={product.ratingCount}
          />
        </div>
        {/* --- KẾT THÚC PHẦN ĐÁNH GIÁ --- */}
        {/* TUYỆT HƠN NẾU MẶC CÙNG (Related Products) (Giữ nguyên) */}
        {related.length > 0 && (
          <div className="mt-16 bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 text-start">
              CÓ THỂ BẠN CŨNG THÍCH
            </h2>
            <RelatedProductsCarousel products={related} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductPage;
