import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, XCircle } from "lucide-react";
import { submitReview } from "@/lib/api"; // Import API
import { toast } from "sonner";

// Component StarRating (Giữ nguyên)
const ClickableStarRating = ({ rating, setRating }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <Star
            key={i}
            size={24}
            className={`cursor-pointer transition-colors
              ${
                ratingValue <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            onClick={() => setRating(ratingValue)}
          />
        );
      })}
    </div>
  );
};

// --- Cập nhật Prop: Nhận 'productItem' thay vì 'product' ---
export default function ReviewModal({ isOpen, onClose, productItem, token }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Hàm xử lý chọn file (Giữ nguyên)
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error("Chỉ được tải lên tối đa 5 ảnh.");
      return;
    }
    setFiles((prev) => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Hàm xóa ảnh (Giữ nguyên)
  const removeImage = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== indexToRemove);
      URL.revokeObjectURL(previews[indexToRemove]);
      return newPreviews;
    });
  };

  // Hàm xử lý gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productItem || !token) return; // <-- Đổi

    setLoading(true);

    // 1. Dữ liệu text (Theo API Postman)
    const reviewData = {
      productId: productItem.productId, // <-- Đổi: Lấy từ item
      rating: String(rating),
      content: content,
      // (Nếu backend cần, bạn có thể gửi cả sku)
      // sku: productItem.sku
    };

    try {
      // 2. Gửi (Hàm submitReview đã được cập nhật để dùng FormData)
      const res = await submitReview(reviewData, files, token);

      if (res.status === true) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        onClose(true); // Đóng modal và báo thành công
      } else {
        toast.error(res.message || "Gửi đánh giá thất bại.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // Reset state khi modal đóng (Giữ nguyên)
  const handleModalChange = (open) => {
    if (!open) {
      onClose(false);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setRating(5);
      setContent("");
      setFiles([]);
      setPreviews([]);
    }
  };

  if (!productItem) return null; // <-- Đổi

  return (
    <Dialog open={isOpen} onOpenChange={handleModalChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thông tin sản phẩm */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
            <img
              src={productItem.image} // <-- Đổi
              alt={productItem.name} // <-- Đổi
              className="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <p className="font-medium">{productItem.name}</p> {/* <-- Đổi */}
            </div>
          </div>

          {/* 1. Chọn sao (Giữ nguyên) */}
          <div className="flex flex-col items-center space-y-2">
            <p className="font-medium">Chất lượng sản phẩm *</p>
            <ClickableStarRating rating={rating} setRating={setRating} />
          </div>

          {/* 2. Nhập bình luận (Giữ nguyên) */}
          <div>
            <Textarea
              placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
          </div>

          {/* 3. Tải ảnh (Giữ nguyên) */}
          <div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={16} />
              Thêm hình ảnh ({files.length}/5)
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {previews.map((previewUrl, index) => (
                <div key={index} className="relative w-16 h-16">
                  <img
                    src={previewUrl}
                    alt={`preview ${index}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full text-red-500"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading || content.length < 5}>
              {loading ? "Đang gửi..." : "Hoàn tất"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
