import { useState } from "react";
import { Button } from "@/components/ui/button";

function FilterSidebar({ onFilterChange }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [price, setPrice] = useState([100000, 500000]);

  const applyFilters = () => {
    onFilterChange({
      size: selectedSize,
      color: selectedColor,
      minPrice: price[0],
      maxPrice: price[1],
    });
  };

  return (
    <div>
      <h4 className="font-medium mb-2">Size</h4>
      <div className="flex gap-2 mb-4">
        {["S", "M", "L", "XL"].map((s) => (
          <Button
            key={s}
            variant={selectedSize === s ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSize(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <h4 className="font-medium mb-2">Màu sắc</h4>
      <div className="flex gap-2 mb-4">
        {["Đen", "Trắng", "Xanh"].map((c) => (
          <Button
            key={c}
            variant={selectedColor === c ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedColor(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <h4 className="font-medium mb-2">Khoảng giá</h4>
      <input
        type="range"
        min="100000"
        max="2000000"
        step="50000"
        value={price[1]}
        onChange={(e) => setPrice([price[0], parseInt(e.target.value)])}
        className="w-full mb-2"
      />
      <div className="text-sm mb-4">
        {price[0].toLocaleString()} đ - {price[1].toLocaleString()} đ
      </div>

      <Button className="w-full" onClick={applyFilters}>
        Áp dụng
      </Button>
    </div>
  );
}

export default FilterSidebar;
