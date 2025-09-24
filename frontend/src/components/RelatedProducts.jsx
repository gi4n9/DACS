import ProductCard from "@/components/ProductCard";

const relatedProducts = [
  { id: 2, name: "Áo Polo Nam Basic", price: 249000, img: "/img/polo.jpg" },
  { id: 3, name: "Áo Thun Nam Slim Fit", price: 199000, img: "/img/thun.jpg" },
  {
    id: 4,
    name: "Áo Khoác Nam Thể Thao",
    price: 399000,
    img: "/img/khoac.jpg",
  },
];

function RelatedProducts() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {relatedProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default RelatedProducts;
