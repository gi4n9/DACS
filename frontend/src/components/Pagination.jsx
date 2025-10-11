import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  const maxPagesToShow = 5; // Số trang tối đa hiển thị (không tính trang đầu, cuối, và ellipsis)
  const pages = [];

  // Kiểm tra giá trị đầu vào
  console.log(
    `Pagination: currentPage=${currentPage}, totalPages=${totalPages}`
  );

  // Tính toán các trang hiển thị
  const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  // Thêm trang 1
  pages.push(1);

  // Thêm ellipsis nếu cần
  if (startPage > 2) {
    pages.push("...");
  }

  // Thêm các trang ở giữa
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Thêm ellipsis và trang cuối nếu cần
  if (endPage < totalPages - 1) {
    pages.push("...");
  }
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    console.log(
      `Pagination: Attempting to change to page ${newPage} from ${currentPage}`
    );
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    } else {
      console.warn(`Pagination: Invalid page change attempt to ${newPage}`);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 my-6">
      {/* Nút Trước */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        onMouseEnter={() =>
          console.log(
            `Pagination: Hovering on Previous button, disabled=${
              currentPage <= 1
            }`
          )
        }
        disabled={currentPage <= 1}
        className={`h-10 w-10 rounded-full border-gray-300 hover:bg-gray-100 disabled:opacity-50 ${
          currentPage > 1 ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Danh sách số trang */}
      {pages.map((page, index) => (
        <Button
          key={`${page}-${index}`}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (typeof page === "number") {
              console.log(`Pagination: Clicking page number ${page}`);
              handlePageChange(page);
            }
          }}
          onMouseEnter={() =>
            console.log(
              `Pagination: Hovering on page ${page}, disabled=${
                typeof page !== "number"
              }`
            )
          }
          className={`h-10 w-10 rounded-full ${
            page === currentPage
              ? "bg-primary text-white"
              : "border-gray-300 hover:bg-gray-100"
          } ${
            typeof page === "number" && page !== currentPage
              ? "cursor-pointer"
              : typeof page !== "number"
              ? "cursor-default"
              : "cursor-not-allowed"
          }`}
          disabled={typeof page !== "number"}
        >
          {page}
        </Button>
      ))}

      {/* Nút Sau */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        onMouseEnter={() =>
          console.log(
            `Pagination: Hovering on Next button, disabled=${
              currentPage >= totalPages
            }`
          )
        }
        disabled={currentPage >= totalPages}
        className={`h-10 w-10 rounded-full border-gray-300 hover:bg-gray-100 disabled:opacity-50 ${
          currentPage < totalPages ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export default Pagination;
