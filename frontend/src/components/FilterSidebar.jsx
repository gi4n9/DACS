import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

function FilterSidebar({ onFilterChange }) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [priceRange, setPriceRange] = useState([100000, 500000]);

  const applyFilter = () => {
    onFilterChange({ size, color, priceRange });
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold">Bộ lọc</h4>

      {/* Size */}
      <div>
        <h6 className="mb-2">Size</h6>
        {["S", "M", "L", "XL"].map((s) => (
          <Button
            key={s}
            variant={s === size ? "default" : "outline"}
            className="me-2"
            onClick={() => setSize(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Color */}
      <div>
        <h6 className="mb-2">Màu sắc</h6>
        {["Đen", "Trắng", "Xanh"].map((c) => (
          <Button
            key={c}
            variant={c === color ? "default" : "outline"}
            className="me-2"
            onClick={() => setColor(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Price Range */}
      <div>
        <h6 className="mb-2">Khoảng giá</h6>
        <Slider
          min={50000}
          max={1000000}
          step={50000}
          value={priceRange}
          onValueChange={setPriceRange}
        />
        <p className="text-sm mt-2">
          {priceRange[0].toLocaleString()} đ - {priceRange[1].toLocaleString()}{" "}
          đ
        </p>
      </div>

      {/* Apply */}
      <Button onClick={applyFilter} className="w-full">
        Áp dụng
      </Button>
    </div>
  );
}

export default FilterSidebar;
