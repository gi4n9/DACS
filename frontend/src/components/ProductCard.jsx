import { Card, CardContent } from "@/components/ui/card";

function ProductCard({ product }) {
  return (
    <Card className="hover:shadow-md transition">
      <img
        src={product.img}
        alt={product.name}
        className="w-full h-60 object-cover rounded-t-xl"
      />
      <CardContent className="p-3 text-center">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="text-base font-bold mt-1">
          {product.price.toLocaleString()} đ
        </p>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
