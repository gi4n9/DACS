import ProductCard from "@/components/ProductCard";

function RelatedProducts({ products }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.product_id} product={p} />
      ))}
    </div>
  );
}

export default RelatedProducts;
