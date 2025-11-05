import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Pagination({ currentPage, totalPages, onPageChange }) {
  // --- THAY ĐỔI: Tăng số trang hiển thị từ 5 lên 7 ---
  // Bạn có thể đổi số 7 này thành 10, 15, v.v. tùy ý
  const maxPagesToShow = 7; //
  const pages = [];

  // Tính toán các trang hiển thị
  // (Đã điều chỉnh logic để xử lý endPage chính xác hơn)
  let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

  // Điều chỉnh lại startPage nếu endPage chạm mốc totalPages
  if (endPage === totalPages - 1) {
    startPage = Math.max(2, endPage - maxPagesToShow + 1);
  }

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
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 my-6">
      {/* Nút Trước */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="h-10 w-10 rounded-full border-gray-300 hover:bg-gray-100 disabled:opacity-50"
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
              handlePageChange(page);
            }
          }}
          className={`h-10 w-10 rounded-full ${
            page === currentPage
              ? "bg-primary text-white" // Nút được chọn
              : "border-gray-300 hover:bg-gray-100" // Nút thường
          } ${
            typeof page !== "number" ? "cursor-default" : "cursor-pointer" // Vô hiệu hóa click cho "..."
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
        disabled={currentPage >= totalPages}
        className="h-10 w-10 rounded-full border-gray-300 hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export default Pagination;
