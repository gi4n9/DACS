import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom"; // Import Link

// --- Biến và Hàm Helper ---
const API_URL = import.meta.env.VITE_API_URL;

// Lấy token từ cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Format tiền tệ (VND)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format ngày (dd/mm/yyyy)
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Mapping trạng thái
const getStatusLabel = (status) => {
  switch (status) {
    case "paid":
      return { text: "Đã thanh toán", color: "text-green-600" };
    case "pending":
      return { text: "Chờ thanh toán", color: "text-yellow-600" };
    case "shipped":
      return { text: "Đang giao", color: "text-blue-600" };
    case "delivered":
      return { text: "Đã giao", color: "text-green-700" };
    case "cancelled":
      return { text: "Đã hủy", color: "text-red-600" };
    default:
      return { text: status, color: "text-gray-600" };
  }
};

// --- Component Card cho từng Đơn hàng ---
const OrderItemCard = ({ order }) => {
  const status = getStatusLabel(order.status);

  return (
    <div className="border rounded-lg shadow-sm mb-4 bg-white">
      {/* Header: Mã đơn & Trạng thái */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 border-b rounded-t-lg">
        <div>
          <span className="text-sm text-gray-500">Mã đơn hàng</span>
          <p className="font-semibold text-gray-900">{order.code}</p>
        </div>
        <div className="mt-2 sm:mt-0 sm:text-right">
          <span className="text-sm text-gray-500">Trạng thái</span>
          <p className={`font-semibold ${status.color}`}>{status.text}</p>
        </div>
      </div>

      {/* Body: Danh sách sản phẩm */}
      <div className="p-4 space-y-3 divide-y">
        {order.items.map((item) => (
          <div
            key={item.sku}
            className="flex items-start space-x-4 pt-3 first:pt-0"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded border bg-gray-200"
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/150")
              } // Ảnh dự phòng
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">
                  Số lượng: {item.quantity}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Ngày đặt & Tổng tiền */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 border-t rounded-b-lg">
        <span className="text-sm text-gray-600">
          Ngày đặt: {formatDate(order.createdAt)}
        </span>
        <span className="font-bold text-lg text-gray-900 mt-2 sm:mt-0">
          Tổng tiền: {formatCurrency(order.total)}
        </span>
      </div>
    </div>
  );
};

// --- Component Trang Lịch sử Đơn hàng ---
export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getCookie("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để xem lịch sử đơn hàng.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/orders`, // Endpoint của bạn
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // API trả về { status: true, data: [...] }
        if (response.data.status === true) {
          setOrders(response.data.data || []);
        } else {
          toast.error(
            response.data.message || "Không thể tải lịch sử đơn hàng."
          );
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        toast.error(
          err.response?.data?.message || "Lỗi máy chủ, vui lòng thử lại."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []); // Chạy 1 lần

  // --- Hàm render nội dung ---
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-500">Đang tải lịch sử đơn hàng...</p>;
    }

    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-start space-y-2">
          <p className="text-gray-700">Bạn chưa có đơn hàng nào.</p>
          <Link
            to="/" // Link về trang chủ để mua sắm
            className="text-sm text-blue-600 hover:underline"
          >
            Bắt đầu mua sắm &rarr;
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Lặp qua danh sách đơn hàng và hiển thị */}
        {orders.map((order) => (
          <OrderItemCard key={order._id} order={order} />
        ))}
      </div>
    );
  };

  return (
    // Dùng layout chung
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6">Lịch sử đơn hàng</h2>

      {renderContent()}
    </div>
  );
}
