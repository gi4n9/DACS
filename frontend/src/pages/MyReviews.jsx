import React, { useState, useEffect } from "react";
import { getUserOrders } from "@/lib/api"; // <-- 1. Import hàm API mới
import { toast } from "sonner";
import ReviewModal from "@/components/ReviewModal"; // Import modal
import { Button } from "@/components/ui/button";

// --- Hàm Helper (Copy từ các file khác) ---
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return { text: "Đã hoàn thành", color: "bg-green-100 text-green-700" };
    case "shipped":
      return { text: "Đang giao", color: "bg-blue-100 text-blue-700" };
    case "pending":
      return { text: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" };
    case "cancelled":
      return { text: "Đã hủy", color: "bg-red-100 text-red-700" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-700" };
  }
};
// --- Kết thúc Helper ---

export default function MyReviews() {
  const [orders, setOrders] = useState([]); // 2. State lưu danh sách đơn hàng
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // State lưu SẢN PHẨM cần đánh giá
  const token = getCookie("token");

  // 3. Hàm tải dữ liệu (gọi API /orders)
  const fetchData = async () => {
    if (!token) {
      toast.error("Bạn cần đăng nhập để xem.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getUserOrders(token); // <-- Gọi API đơn hàng
      if (res.status) {
        setOrders(res.data || []);
      } else {
        toast.error("Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Tải dữ liệu khi component mount
  useEffect(() => {
    fetchData();
  }, [token]);

  // 5. Logic mở/đóng Modal (giữ nguyên)
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = (didSubmit) => {
    setIsModalOpen(false);
    setSelectedItem(null);
    if (didSubmit) {
      // (Trong tương lai, bạn có thể gọi fetchData() để refresh
      // và ẩn nút "Đánh giá" cho sản phẩm vừa được đánh giá)
      fetchData();
    }
  };

  // 6. Logic Render (Cập nhật)
  const renderContent = () => {
    if (loading) return <p>Đang tải danh sách đơn hàng...</p>;
    if (orders.length === 0) return <p>Bạn chưa có đơn hàng nào.</p>;

    // (TODO: Thêm Tabs "Chưa đánh giá" / "Đã đánh giá" ở đây)
    // Hiện tại, chúng ta hiển thị tất cả đơn hàng

    return (
      <div className="space-y-6">
        {/* Lặp qua các ĐƠN HÀNG */}
        {orders.map((order) => {
          const statusStyle = getStatusLabel(order.status);
          return (
            <div key={order._id} className="border rounded-lg shadow-sm">
              {/* Header của Đơn hàng */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b rounded-t-lg">
                <div>
                  <h3 className="font-semibold">Mã đơn: {order.code}</h3>
                  <p className="text-sm text-gray-600">
                    Ngày đặt: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`font-medium px-2 py-1 rounded-full text-xs ${statusStyle.color}`}
                  >
                    {statusStyle.text}
                  </span>
                  <p className="font-bold">{formatCurrency(order.total)}</p>
                </div>
              </div>

              {/* Danh sách SẢN PHẨM trong đơn hàng */}
              <div className="p-4 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <div>
                        <p className="font-medium text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* 7. Logic Nút Đánh giá */}
                    {order.status === "completed" ? (
                      <Button onClick={() => handleOpenModal(item)}>
                        Đánh giá
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Chưa hoàn tất
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Đánh giá và phản hồi</h2>

      {renderContent()}

      {/* Modal sẽ được mở khi `selectedItem` có dữ liệu */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productItem={selectedItem} // Gửi 'item' vào modal
        token={token}
      />
    </div>
  );
}
