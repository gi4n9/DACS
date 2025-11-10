import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUserOrders } from "@/lib/api";
import ReviewModal from "@/components/ReviewModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// --- Helper (Giữ nguyên) ---
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
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    case "paid":
      return { text: "Đã thanh toán", color: "bg-blue-100 text-blue-700" };
    case "cancelled":
      return { text: "Đã hủy", color: "bg-red-100 text-red-700" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-700" };
  }
};
// --- Hết Helper ---

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getCookie("token");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // (Giữ nguyên hàm fetchData)
  const fetchData = async () => {
    if (!token) {
      toast.error("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getUserOrders(token);
      if (res.status === true) {
        setOrders(res.data || []);
      } else {
        toast.error(res.data.message || "Không thể tải lịch sử đơn hàng.");
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đơn hàng:", err);
      toast.error(
        err.response?.data?.message || "Lỗi máy chủ, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // (Giữ nguyên hàm handleOpenModal và handleCloseModal)
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = (didSubmit) => {
    setIsModalOpen(false);
    setSelectedItem(null);
    if (didSubmit) {
      toast.success("Cảm ơn bạn!");
    }
  };

  // (Giữ nguyên hàm toggleTimeline)
  const toggleTimeline = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500">Đang tải lịch sử đơn hàng...</p>;
    }
    if (orders.length === 0) {
      // (Giữ nguyên)
      return (
        <div className="flex flex-col items-start space-y-2">
          <p className="text-gray-700">Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Bắt đầu mua sắm &rarr;
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {orders.map((order) => {
          const statusStyle = getStatusLabel(order.status);
          const isExpanded = expandedOrderId === order._id;

          return (
            <div key={order._id} className="border rounded-lg shadow-sm">
              {/* (Header đơn hàng - Giữ nguyên) */}
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

              {/* (Danh sách item - Giữ nguyên) */}
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
                    {order.status === "completed" ? (
                      <Button onClick={() => handleOpenModal(item)}>
                        Viết đánh giá
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        Đánh giá
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* (Nút bấm Timeline - Giữ nguyên) */}
              <div className="p-4 border-t bg-gray-50/50 rounded-b-lg">
                <Button
                  variant="link"
                  className="p-0 text-sm text-blue-600 hover:underline"
                  onClick={() => toggleTimeline(order._id)}
                >
                  {isExpanded
                    ? "Ẩn chi tiết đơn hàng"
                    : "Xem chi tiết đơn hàng"}
                </Button>
              </div>

              {/* --- CẬP NHẬT: Vùng hiển thị chi tiết --- */}
              {isExpanded && (
                // Thêm `space-y-6` để tạo khoảng cách giữa các phần
                <div className="p-4 border-t border-gray-100 space-y-6">
                  {/* 1. Phần Lịch sử trạng thái (Giữ nguyên) */}
                  <div>
                    <h4 className="font-semibold mb-3 text-md">
                      Lịch sử trạng thái
                    </h4>
                    <ul className="space-y-4 pl-2 border-l border-gray-200">
                      {[...order.timeline].reverse().map((event, index) => {
                        const eventStatus = getStatusLabel(event.status);
                        return (
                          <li key={index} className="relative pl-5">
                            <span className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-white"></span>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(event.at)}
                            </p>
                            <p className="font-medium text-sm my-0.5">
                              <span
                                className={`font-medium px-1.5 py-0.5 rounded text-xs ${eventStatus.color}`}
                              >
                                {eventStatus.text}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              {event.note}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* --- THÊM MỚI: 2. Phần Thông tin giao hàng --- */}
                  <div>
                    <h4 className="font-semibold mb-3 text-md">
                      Thông tin giao hàng
                    </h4>
                    {order.shippingAddress ? (
                      <div className="text-sm text-gray-700 space-y-1 pl-2">
                        <p>
                          <strong>Người nhận:</strong>{" "}
                          {order.shippingAddress.fullName}
                        </p>
                        <p>
                          <strong>Điện thoại:</strong>{" "}
                          {order.shippingAddress.phone}
                        </p>
                        <p className="leading-relaxed">
                          <strong>Địa chỉ:</strong>{" "}
                          {`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 pl-2">
                        Không có thông tin địa chỉ.
                      </p>
                    )}
                  </div>
                  {/* --- HẾT PHẦN THÊM MỚI --- */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Lịch sử đơn hàng</h2>

      {renderContent()}

      {/* (Render Modal - Giữ nguyên) */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productItem={selectedItem}
        token={token}
      />
    </div>
  );
}
