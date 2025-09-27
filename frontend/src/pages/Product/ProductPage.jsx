import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SizeGuideDialog from "@/components/SizeGuideDialog";
import ProductTabs from "@/components/ProductTabs";
import RelatedProducts from "@/components/RelatedProducts";
import { getProductBySlug, getRelatedProducts } from "@/lib/api";

function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProductBySlug(slug);
        setProduct(data);
        setMainImage(data.images[0]);
        setSelectedColor(data.variants[0]);

        const relatedData = await getRelatedProducts(data.category_id, 1, 4);
        setRelated(relatedData.products);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
      }
    };
    fetchData();
  }, [slug]);

  if (!product)
    return <p className="text-center py-10">Đang tải sản phẩm...</p>;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: Gallery */}
          <div>
            <div className="overflow-hidden rounded-xl border group">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-110"
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
            {product.variants && (
              <div>
                <h3 className="font-medium mb-2">Màu sắc</h3>
                <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                  {product.variants.map((v, i) => (
                    <Button
                      key={i}
                      variant={
                        selectedColor?.color === v.color ? "default" : "outline"
                      }
                      onClick={() => {
                        setSelectedColor(v);
                        setMainImage(v.image);
                        setSelectedSize("");
                      }}
                    >
                      {v.color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {selectedColor?.sizes && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Kích thước</h3>
                  <SizeGuideDialog />
                </div>
                <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                  {selectedColor.sizes.map((s, i) => (
                    <Button
                      key={i}
                      variant={s === selectedSize ? "default" : "outline"}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center md:justify-start">
              <Button size="lg" className="flex-1 md:flex-none">
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
