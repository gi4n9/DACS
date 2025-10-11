import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom"; // Loại bỏ useNavigate
import { Button } from "@/components/ui/button";
import SizeGuideDialog from "@/components/SizeGuideDialog";
import ProductTabs from "@/components/ProductTabs";
import RelatedProducts from "@/components/RelatedProducts";
import { getProductById, getRelatedProducts } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

function ProductPage({ user, openAuth }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const groupVariantsByColor = useCallback((variants = []) => {
    const map = {};
    variants.forEach((v) => {
      if (!map[v.color_id]) {
        map[v.color_id] = {
          color_id: v.color_id,
          color_name: v.color_name,
          color_image: v.variant_image,
        };
      }
    });
    return Object.values(map);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        const data = res.data.product;

        // Chuẩn hóa images -> luôn là array
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

        // Lọc unique variants theo variant_id
        let uniqueVariants = [];
        if (data.variants && data.variants.length > 0) {
          uniqueVariants = Array.from(
            new Map(data.variants.map((v) => [v.variant_id, v])).values()
          );
        }

        setProduct({ ...data, images, variants: uniqueVariants });
        setMainImage(images[0] || "");

        // Mặc định chọn màu đầu tiên nếu có
        if (uniqueVariants.length > 0) {
          const firstColor = groupVariantsByColor(uniqueVariants)[0];
          setSelectedColor(firstColor || null);
        }

        // Load sản phẩm liên quan
        if (data.category_id) {
          const relatedRes = await getRelatedProducts(data.category_id, 1, 4);
          setRelated(relatedRes.data.products || []);
        }
      } catch (err) {
        console.error("Lỗi khi load sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, groupVariantsByColor]);

  function animateFlyToCart(imageSrc) {
    const cartIcon = document.querySelector("a[href='/cart']");
    if (!cartIcon) {
      console.warn("Không tìm thấy biểu tượng giỏ hàng");
      return;
    }

    const img = document.createElement("img");
    img.src = imageSrc;
    img.className =
      "fixed w-20 h-20 object-cover rounded-full z-[9999] pointer-events-none transition-all duration-700 ease-in-out";

    // Lấy vị trí của mainImage
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

  if (loading) return <p className="text-center py-10">Đang tải sản phẩm...</p>;
  if (!product)
    return <p className="text-center py-10">Không tìm thấy sản phẩm</p>;

  return (
    <div className="w-full flex justify-center mt-[150px]">
      <div className="w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: Gallery */}
          <div>
            <div className="overflow-hidden rounded-xl border group transition-transform hover:scale-105 mb-10">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-[650px] object-cover duration-300 main-product-image"
              />
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`thumb-${i}`}
                  className={`w-20 h-20 object-cover cursor-pointer rounded-md border transition
                    ${mainImage === img ? "border-black" : "border-gray-300"}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-2xl font-bold">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="text-xl font-bold text-black">
                {product.price.toLocaleString()} đ
              </span>
              {product.origin_price && (
                <span className="text-gray-500 line-through">
                  {product.origin_price.toLocaleString()} đ
                </span>
              )}
            </div>

            {/* Colors */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Màu sắc</h3>
                <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                  {groupVariantsByColor(product.variants).map((color) => (
                    <Button
                      key={color.color_id}
                      variant={
                        selectedColor?.color_id === color.color_id
                          ? "default"
                          : "outline"
                      }
                      onClick={() => {
                        setSelectedColor(color);
                        setMainImage(color.color_image || product.images[0]);
                        setSelectedSize("");
                      }}
                    >
                      {color.color_name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {selectedColor && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Kích thước</h3>
                  <SizeGuideDialog />
                </div>
                <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                  {product.variants
                    .filter((v) => v.color_id === selectedColor.color_id)
                    .map((v) => (
                      <Button
                        key={v.size_id}
                        variant={
                          selectedSize === v.size_name ? "default" : "outline"
                        }
                        onClick={() => setSelectedSize(v.size_name)}
                      >
                        {v.size_name}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="flex-1 md:flex-none"
                disabled={!selectedSize || !selectedColor}
                onClick={async () => {
                  if (!user) {
                    toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
                    openAuth(); // Mở form đăng nhập
                    return;
                  }

                  if (!selectedSize || !selectedColor) {
                    toast.error("Vui lòng chọn màu và kích thước!");
                    return;
                  }

                  const chosenVariant = product.variants.find(
                    (v) =>
                      v.color_id === selectedColor.color_id &&
                      v.size_name === selectedSize
                  );

                  if (!chosenVariant) {
                    toast.error("Không tìm thấy biến thể phù hợp!");
                    return;
                  }

                  const productItem = {
                    product_id: product.product_id,
                    variant_id: chosenVariant.variant_id,
                    name: product.name,
                    color: selectedColor.color_name,
                    size: selectedSize,
                    price: product.price,
                    qty: 1,
                    image: mainImage || product.images[0],
                  };

                  const success = await addToCart(productItem);
                  if (success) {
                    animateFlyToCart(mainImage || product.images[0]);
                    // Đã loại bỏ navigate("/cart") để không chuyển hướng
                  }
                }}
              >
                Thêm vào giỏ
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 md:flex-none"
              >
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs description={product.description} />

        {/* Related */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Sản phẩm liên quan</h2>
          <RelatedProducts products={related} />
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
