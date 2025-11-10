import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

// --- THAY ĐỔI: Nhận filters, onFilterChange (để cập nhật nháp), và onApply (để áp dụng) ---
function FilterSidebar({ filters, onFilterChange, onApply }) {
  // --- ĐÃ XÓA: Toàn bộ useState nội bộ (selectedSize, selectedColor, price) ---

  // Hàm xử lý khi chọn Size (cho phép toggle)
  const handleSizeClick = (s) => {
    onFilterChange({
      ...filters,
      size: filters.size === s ? null : s, // Nếu bấm lại, bỏ chọn
    });
  };

  // Hàm xử lý khi chọn Color (cho phép toggle)
  const handleColorClick = (c) => {
    onFilterChange({
      ...filters,
      color: filters.color === c ? null : c, // Nếu bấm lại, bỏ chọn
    });
  };

  // Hàm xử lý khi kéo slider giá
  const handlePriceChange = (e) => {
    onFilterChange({
      ...filters,
      maxPrice: parseInt(e.target.value),
    });
  };

  const handleRatingClick = (r) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === r ? null : r, // Toggle
    });
  };

  return (
    <div>
      <h4 className="font-medium mb-2">Size</h4>
      <div className="flex gap-2 mb-4 flex-wrap">
        {" "}
        {/* Thêm flex-wrap */}
        {["S", "M", "L", "XL"].map((s) => (
          <Button
            key={s}
            // --- THAY ĐỔI: Đọc từ props `filters` ---
            variant={filters.size === s ? "default" : "outline"}
            size="sm"
            onClick={() => handleSizeClick(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <h4 className="font-medium mb-2">Màu sắc</h4>
      <div className="flex gap-2 mb-4 flex-wrap">
        {" "}
        {/* Thêm flex-wrap */}
        {["Đen", "Trắng", "Xanh"].map((c) => (
          <Button
            key={c}
            // --- THAY ĐỔI: Đọc từ props `filters` ---
            variant={filters.color === c ? "default" : "outline"}
            size="sm"
            onClick={() => handleColorClick(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <h4 className="font-medium mb-2">Khoảng giá</h4>
      <input
        type="range"
        // --- THAY ĐỔI: Đọc từ props `filters` ---
        min={filters.minPrice} // Lấy minPrice từ props
        max="5000000" // Tăng giới hạn max
        step="50000"
        value={filters.maxPrice}
        onChange={handlePriceChange}
        className="w-full mb-2"
      />
      <div className="text-sm mb-4">
        {/* --- THAY ĐỔI: Đọc từ props `filters` --- */}
        {filters.minPrice.toLocaleString()} đ -{" "}
        {filters.maxPrice.toLocaleString()} đ
      </div>

      <h4 className="font-medium mb-2">Đánh giá</h4>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[5, 4, 3].map((r) => (
          <Button
            key={r}
            variant={filters.minRating === r ? "default" : "outline"}
            size="sm"
            onClick={() => handleRatingClick(r)}
            className="flex items-center gap-1"
          >
            {r} <Star size={14} className="text-yellow-400 fill-yellow-400" />
            {r < 5 && " +"} {/* Thêm chữ " + " cho 4 và 3 sao */}
          </Button>
        ))}
      </div>

      <Button className="w-full" onClick={onApply}>
        {" "}
        {/* --- THAY ĐỔI: Gọi onApply --- */}
        Áp dụng
      </Button>
    </div>
  );
}

export default FilterSidebar;
