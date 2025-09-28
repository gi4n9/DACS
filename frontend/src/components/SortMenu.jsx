import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SortMenu({ onSortChange }) {
  return (
    <Select onValueChange={onSortChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sắp xếp" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="price_asc">Giá tăng dần</SelectItem>
        <SelectItem value="price_desc">Giá giảm dần</SelectItem>
        <SelectItem value="newest">Mới nhất</SelectItem>
        <SelectItem value="bestseller">Bán chạy</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default SortMenu;
