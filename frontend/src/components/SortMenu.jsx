import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Nhận 'value' (state) và 'onSortChange' (hàm setSort)
function SortMenu({ value, onSortChange }) {
  // 1. Hàm xử lý mới
  const handleChange = (newValue) => {
    // Nếu người dùng chọn "default", chúng ta gọi onSortChange(null)
    // để reset state 'sort' về null (thay vì "default")
    if (newValue === "default") {
      onSortChange(null);
    } else {
      onSortChange(newValue);
    }
  };

  // 2. Nếu state 'value' là null, chúng ta hiển thị là "default"
  const displayValue = value || "default";

  return (
    // 3. Cập nhật các props
    <Select onValueChange={handleChange} value={displayValue}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sắp xếp" />
      </SelectTrigger>
      <SelectContent>
        {/* 4. Sửa giá trị từ "" thành "default" */}
        <SelectItem value="default">Mặc định</SelectItem>
        <SelectItem value="price_asc">Giá tăng dần</SelectItem>
        <SelectItem value="price_desc">Giá giảm dần</SelectItem>
        <SelectItem value="newest">Mới nhất</SelectItem>
        <SelectItem value="bestseller">Bán chạy</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default SortMenu;
