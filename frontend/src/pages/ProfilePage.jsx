import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMyOrders, resendOrderConfirmation } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || "";

// Lấy cookie token
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Mock data nếu backend chưa sẵn sàng
const sampleOrders = [
  {
    order_id: "ORD-20251001-001",
    created_at: new Date().toISOString(),
    status: "confirmed",
    tracking_number: "TRK123456789",
    items: [
      { name: "Áo Thun Nam", qty: 1, price: 199000 },
      { name: "Quần Jogger", qty: 1, price: 299000 },
    ],
    total: 498000,
    emailSent: true,
    emailSentAt: new Date().toISOString(),
  },
  {
    order_id: "ORD-20251002-002",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "shipped",
    tracking_number: "TRK987654321",
    items: [{ name: "Áo Khoác", qty: 1, price: 599000 }],
    total: 599000,
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

function formatCurrency(v) {
  return Number.isFinite(v)
    ? v.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : "0 đ";
}

function OrderTimeline({ status }) {
  const steps = [
    { key: "confirmed", label: "Xác nhận" },
    { key: "processing", label: "Đang xử lý" },
    { key: "shipped", label: "Đã gửi" },
    { key: "delivered", label: "Đã giao" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-4">
      {steps.map((step, idx) => {
        const active = idx <= currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                active ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {idx + 1}
            </div>
            <div className="text-xs text-gray-600">{step.label}</div>
            {idx !== steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  idx < currentIndex ? "bg-primary" : "bg-gray-200"
                }`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderTimelineModal({ order, onClose }) {
  if (!order) return null;
  const history = [
    { status: "confirmed", time: order.created_at, note: "Đã nhận đơn" },
    {
      status: "processing",
      time: new Date(Date.parse(order.created_at) + 3600 * 1000).toISOString(),
      note: "Đang đóng gói",
    },
    {
      status: "shipped",
      time: new Date(
        Date.parse(order.created_at) + 5 * 3600 * 1000
      ).toISOString(),
      note: "Giao cho đơn vị vận chuyển",
    },
    {
      status: "delivered",
      time: new Date(
        Date.parse(order.created_at) + 48 * 3600 * 1000
      ).toISOString(),
      note: "Giao thành công",
    },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Theo dõi đơn hàng {order.order_id}
          </h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
        <div className="mb-4">
          <OrderTimeline status={order.status} />
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
              <div>
                <div className="text-sm font-medium">{h.note}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(h.time).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <a
            href={`https://tracking.example.com/${order.tracking_number}`}
            target="_blank"
            rel="noreferrer"
            className="mr-2"
          >
            <Button variant="secondary" size="sm">
              Mở tracking
            </Button>
          </a>
          <Button size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEmailPreview, setShowEmailPreview] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const token = getCookie("token");
      if (!token) {
        // Không có token -> show mock
        setOrders(sampleOrders);
        setLoading(false);
        return;
      }
      try {
        const serverOrders = await getMyOrders(token);
        // normalize mỗi order để UI dùng chung
        const normalizeOrder = (o) => ({
          order_id:
            o.order_id ||
            o.id ||
            o._id ||
            o.orderId ||
            o.reference ||
            "unknown",
          created_at:
            o.created_at || o.createdAt || o.date || new Date().toISOString(),
          status: o.status || o.state || "confirmed",
          tracking_number:
            o.tracking_number || o.tracking || o.trackingNumber || "",
          items: o.items || o.order_items || o.products || o.items_list || [],
          total: o.total || o.total_price || o.amount || o.grand_total || 0,
          emailSent:
            typeof o.emailSent !== "undefined"
              ? o.emailSent
              : !!(o.email_sent || o.confirmed_at),
          emailSentAt:
            o.emailSentAt || o.email_sent_at || o.confirmed_at || null,
        });
        setOrders(
          Array.isArray(serverOrders) ? serverOrders.map(normalizeOrder) : []
        );
      } catch (err) {
        console.warn("Lỗi khi lấy orders, dùng mock:", err);
        setOrders(sampleOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleResendConfirmation = async (orderId) => {
    const token = getCookie("token");
    if (!token) {
      toast?.error
        ? toast.error("Vui lòng đăng nhập để gửi lại mail")
        : alert("Vui lòng đăng nhập để gửi lại mail");
      return;
    }
    try {
      await resendOrderConfirmation(orderId, token);
      // cập nhật local state: tìm order và cập nhật emailSent/emailSentAt
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId
            ? { ...o, emailSent: true, emailSentAt: new Date().toISOString() }
            : o
        )
      );
      toast?.success
        ? toast.success("Đã gửi lại email xác nhận")
        : alert("Đã gửi lại email xác nhận");
    } catch (err) {
      console.error(err);
      toast?.error
        ? toast.error("Gửi lại email thất bại")
        : alert("Gửi lại email thất bại");
    }
  };

  if (!user) {
    return (
      <div className="p-6 mt-[150px]">
        <p className="text-lg">Bạn chưa đăng nhập.</p>
        <p className="text-sm text-muted-foreground">
          Vui lòng đăng nhập để xem đơn hàng theo dõi.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 mt-[150px] max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thông tin cá nhân</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow">
          <p>
            <strong>Họ tên:</strong> {user.full_name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phone || "-"}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {user.address || "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="font-semibold mb-2">Tùy chọn</h3>
          <Button
            className="w-full mb-2"
            onClick={() => {
              navigator.clipboard?.writeText(user.email);
              toast?.success
                ? toast.success("Đã sao chép email")
                : alert("Đã sao chép email");
            }}
          >
            Sao chép email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              localStorage.removeItem("user");
              document.cookie = "token=; path=/; maxAge=0";
              window.location.reload();
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-6">Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className="text-center py-6 text-gray-500">
            Bạn chưa có đơn hàng nào.
          </p>
        ) : (
          orders.map((o) => (
            <div
              key={o.order_id}
              className="bg-white rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Mã đơn</div>
                    <div className="font-medium">{o.order_id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Ngày đặt
                    </div>
                    <div>{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Trạng thái
                    </div>
                    <div className="font-medium capitalize">{o.status}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Sản phẩm
                    </div>
                    <div className="text-sm">
                      {o.items
                        ?.slice(0, 2)
                        .map((i) => `${i.name} x${i.qty}`)
                        .join(", ") || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tổng</div>
                    <div className="font-medium">{formatCurrency(o.total)}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  {o.emailSent
                    ? `Email xác nhận đã gửi lúc ${new Date(
                        o.emailSentAt
                      ).toLocaleString()}`
                    : "Chưa gửi email xác nhận"}
                </div>
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
                <Button size="sm" onClick={() => setSelectedOrder(o)}>
                  Theo dõi
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEmailPreview(o)}
                >
                  Xem mail
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleResendConfirmation(o.order_id)}
                >
                  Gửi lại mail
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal timeline */}
      {selectedOrder && (
        <OrderTimelineModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Email preview */}
      {showEmailPreview && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Email xác nhận - {showEmailPreview.order_id}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailPreview(null)}
              >
                Đóng
              </Button>
            </div>
            <div className="border rounded p-4 bg-gray-50">
              <p>
                Xin chào <strong>{user.full_name}</strong>,
              </p>
              <p className="mt-2">
                Cảm ơn bạn đã đặt hàng tại cửa hàng. Đơn hàng của bạn đã được
                tiếp nhận với thông tin:
              </p>
              <ul className="mt-3 list-disc pl-6 text-sm">
                <li>
                  Mã đơn: <strong>{showEmailPreview.order_id}</strong>
                </li>
                <li>
                  Ngày: {new Date(showEmailPreview.created_at).toLocaleString()}
                </li>
                <li>Tổng: {formatCurrency(showEmailPreview.total)}</li>
                <li>Trạng thái hiện tại: {showEmailPreview.status}</li>
              </ul>
              <div className="mt-4">
                <p className="text-sm font-medium">Chi tiết sản phẩm:</p>
                <ul className="mt-2 list-disc pl-6 text-sm">
                  {showEmailPreview.items?.map((it, i) => (
                    <li key={i}>
                      {it.name} x{it.qty} — {formatCurrency(it.price)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Đây là bản xem trước email xác nhận. Khi backend gửi email thật,
                khách sẽ nhận mail kèm thời gian xác nhận và link theo dõi.
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    JSON.stringify(showEmailPreview)
                  );
                  toast?.success
                    ? toast.success("Đã sao chép nội dung email")
                    : alert("Đã sao chép nội dung email");
                }}
              >
                Sao chép nội dung mail
              </Button>
              <Button onClick={() => setShowEmailPreview(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
