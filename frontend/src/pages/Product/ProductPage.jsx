import { useState } from "react";
import { Button } from "@/components/ui/button";
import { productData } from "@/data/product";
import SizeGuideDialog from "@/components/SizeGuideDialog";
import ProductTabs from "@/components/ProductTabs";
import RelatedProducts from "@/components/RelatedProducts";

function ProductPage() {
  const [selectedColor, setSelectedColor] = useState(productData.variants[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState(productData.images[0]);

  const handleColorChange = (variant) => {
    setSelectedColor(variant);
    setMainImage(variant.image);
    setSelectedSize("");
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left: Gallery */}
          <div>
            <div className="overflow-hidden rounded-xl border group">
              <img
                src={mainImage}
                alt={productData.name}
                className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            {/* thumbnails */}
            <div className="flex gap-3 mt-4 justify-center">
              {productData.images.map((img, i) => (
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
          <div className="space-y-6 text-center md:text-left ">
            <h1 className="text-2xl font-bold">{productData.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span className="text-xl font-bold text-red-600">
                {productData.price.toLocaleString()} đ
              </span>
              <span className="text-gray-400 line-through">
                {productData.origin_price.toLocaleString()} đ
              </span>
              <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                -
                {Math.round(
                  (productData.discount / productData.origin_price) * 100
                )}
                %
              </span>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-medium mb-2">Màu sắc</h3>
              <div className="flex gap-2 justify-center md:justify-start flex-wrap">
                {productData.variants.map((v, i) => (
                  <Button
                    key={i}
                    variant={
                      v.color === selectedColor.color ? "default" : "outline"
                    }
                    onClick={() => handleColorChange(v)}
                  >
                    {v.color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sizes */}
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
        <ProductTabs description={productData.description} />

        {/* Related */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Sản phẩm liên quan</h2>
          <RelatedProducts />
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
