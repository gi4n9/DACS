import React, { useState, useEffect } from "react";
import { getProductReviews } from "@/lib/api";
import { Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/Pagination"; // Tái sử dụng component Pagination

// Helper: Component render các ngôi sao
const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
};

// Helper: Format ngày (dd/mm/yyyy)
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function ProductReviews({ productId, ratingAvg, ratingCount }) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("-createdAt"); // Giống API: mới nhất

  // State cho các bộ lọc
  const [filters, setFilters] = useState({
    rating: null,
    hasImages: false,
    hasFeedback: false, // (Lọc "Đã phản hồi" từ ảnh)
  });

  // (API của bạn chưa hỗ trợ search term, nhưng chúng ta giữ UI)
  const [searchTerm, setSearchTerm] = useState("");

  // useEffect để fetch data khi state thay đổi
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await getProductReviews(productId, page, 10, sort, filters);
        if (res.status && res.data) {
          setReviews(res.data.items || []);
          setPagination(res.data.pagination || {});
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId, page, sort, filters]);

  // Hàm xử lý khi bấm lọc theo số sao
  const handleFilterByRating = (rating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? null : rating, // Toggle (bấm lần nữa để bỏ)
    }));
    setPage(1); // Reset về trang 1
  };

  // Hàm xử lý khi check "Có hình ảnh"
  const handleFilterByImage = (checked) => {
    setFilters((prev) => ({
      ...prev,
      hasImages: checked,
    }));
    setPage(1); // Reset về trang 1
  };

  // Hàm xử lý khi check "Đã phản hồi"
  const handleFilterByFeedback = (checked) => {
    setFilters((prev) => ({
      ...prev,
      hasFeedback: checked,
    }));
    setPage(1); // Reset về trang 1
  };

  return (
    <div className="mt-16 bg-white p-6 md:p-8 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">ĐÁNH GIÁ SẢN PHẨM</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* === CỘT LỌC (BÊN TRÁI) === */}
        <aside className="md:col-span-1 space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Lọc đánh giá</h4>
            <div className="relative">
              <Input
                placeholder="Tìm kiếm đánh giá"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Phân loại xếp hạng</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <Checkbox
                    id={`star-${star}`}
                    checked={filters.rating === star}
                    onCheckedChange={() => handleFilterByRating(star)}
                  />
                  <label
                    htmlFor={`star-${star}`}
                    className="ml-2 flex items-center cursor-pointer"
                  >
                    <Star
                      size={16}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="ml-1">{star} sao</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Lọc phản hồi</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox
                  id="filter-feedback"
                  checked={filters.hasFeedback}
                  onCheckedChange={handleFilterByFeedback}
                />
                <label
                  htmlFor="filter-feedback"
                  className="ml-2 cursor-pointer"
                >
                  Đã phản hồi
                </label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id="filter-image"
                  checked={filters.hasImages}
                  onCheckedChange={handleFilterByImage}
                />
                <label htmlFor="filter-image" className="ml-2 cursor-pointer">
                  Có hình ảnh
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* === CỘT HIỂN THỊ (BÊN PHẢI) === */}
        <main className="md:col-span-2">
          {/* Summary (Tổng quan) */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <span className="text-5xl font-bold">
                {ratingAvg?.toFixed(1) || 0}
              </span>
              <div className="flex justify-center">
                {/* Dùng StarRating helper */}
                <StarRating rating={Math.round(ratingAvg || 0)} size={20} />
              </div>
              <span className="text-sm text-gray-500">
                Dựa trên {ratingCount || 0} đánh giá
              </span>
            </div>
            {/* (Bỏ qua phần slider Chật/Rộng vì API không hỗ trợ) */}
          </div>

          {/* Sort dropdown */}
          <div className="flex justify-end mb-4">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Mới nhất</SelectItem>
                <SelectItem value="createdAt">Cũ nhất</SelectItem>
                <SelectItem value="-rating">Đánh giá cao</SelectItem>
                <SelectItem value="rating">Đánh giá thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {loading && <p>Đang tải đánh giá...</p>}
            {!loading && reviews.length === 0 && (
              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            )}

            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* (API của bạn không trả về tên user, dùng tạm "Khách hàng") */}
                    <span className="font-semibold">{"Khách hàng"}</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {/* (API của bạn không có "Shopee", dùng "Đã mua hàng") */}
                  {review.isVerifiedPurchase && (
                    <span className="text-xs text-green-600">
                      ✔ Đã mua hàng
                    </span>
                  )}
                </div>
                {/* Rating của review đó */}
                <div className="flex items-center gap-1 my-1">
                  <StarRating rating={review.rating} size={14} />
                </div>
                {/* (API của bạn không trả về variant đã mua, tạm ẩn) */}
                {/* <p className="text-sm text-gray-500">Kích thước: L, Màu sắc: Xanh</p> */}

                {/* Nội dung review */}
                <p className="mt-2 text-sm">{review.content}</p>

                {/* Hiển thị ảnh (nếu có) */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {review.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="review-img"
                        className="w-16 h-16 rounded object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={(newPage) => {
                  if (newPage !== page) setPage(newPage);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
