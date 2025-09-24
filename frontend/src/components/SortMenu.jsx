import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortDesc } from "lucide-react";

function SortMenu({ onSortChange }) {
  const [selected, setSelected] = useState("Mặc định");

  const handleSort = (type) => {
    setSelected(type);
    onSortChange(type);
  };

  return (
    <div className="flex justify-end mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <SortDesc size={16} /> {selected}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleSort("Mới nhất")}>
            Mới nhất
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("Giá tăng dần")}>
            Giá tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("Giá giảm dần")}>
            Giá giảm dần
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("Bán chạy")}>
            Bán chạy
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default SortMenu;
