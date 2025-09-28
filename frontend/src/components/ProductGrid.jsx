import ProductCard from "./ProductCard";

function ProductGrid({ products }) {
  if (!products || products.length === 0) {
    return <p className="text-center text-gray-500 py-10">Không có sản phẩm nào</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.product_id} product={p} />
      ))}
    </div>
  );
}

export default ProductGrid;
