import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL;

// Hàm lấy token từ cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export default function Cart({ openAuth }) {
  const { cart, removeFromCart, clearCart, updateCartQuantity } = useCart();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    email: "",
    shipping_address: "",
    note: "",
  });
  const [callOther, setCallOther] = useState(false);
  const [vatInvoice, setVatInvoice] = useState(false);
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const navigate = useNavigate();

  // Lấy thông tin user từ API /api/users/me khi component mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = getCookie("token");
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            // Thêm withCredentials nếu cần thiết (dựa theo App.jsx)
            withCredentials: true,
          });
          setUser(response.data.data);
        } catch (err) {
          console.error("Lỗi khi lấy thông tin user:", err);
          setUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  // Debug user và openAuth
  console.log("User object in Cart:", user);
  console.log("openAuth type:", typeof openAuth);

  // Cập nhật dữ liệu form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Kiểm tra form hợp lệ
  const isFormValid = () => {
    return (
      formData.recipient_name.trim() !== "" &&
      formData.recipient_phone.trim() !== "" &&
      formData.shipping_address.trim() !== ""
    );
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    const token = getCookie("token");
    if (!user || !user.user_id || !token) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      console.log("User or token invalid:", { user, token });
      if (typeof openAuth === "function") {
        openAuth();
      } else {
        console.warn("openAuth is not a function, redirecting to /login");
        navigate("/login");
      }
      return;
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    if (!isFormValid()) {
      toast.error("Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ!");
      return;
    }

    setPaymentLoading(true);
    try {
      // Chuẩn bị payload cho API tạo đơn hàng
      const orderPayload = {
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        shipping_address: formData.shipping_address,
        total_price: total,
        shipping_fee: 20000,
        discount: 0,
        amount_paid: total + 20000,
        payment_method: selectedPayment,
        shipping_method: "GHN",
        items: cart.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id, // item.variant_id giờ là SKU (đã map trong context)
          quantity: item.qty,
          unit_price: item.price,
          discount: 0,
          tax: 0,
          subtotal: item.price * item.qty,
        })),
      };

      console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

      // Gọi API tạo đơn hàng
      const orderResponse = await fetch(
        `${API_URL}/api/orders/${user.user_id}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Lỗi khi tạo đơn hàng");
      }

      const orderData = await orderResponse.json();
      // Giả sử API trả về order_id trong orderData.data.order_id hoặc tương tự
      const orderId = orderData.data?.order_id || orderData.order?.order_id;

      if (!orderId) {
        throw new Error("Không nhận được order_id sau khi tạo đơn hàng");
      }

      // Nếu chọn Momo hoặc ZaloPay, gọi API thanh toán
      if (selectedPayment === "momo" || selectedPayment === "zalopay") {
        const paymentPayload = {
          amount: orderPayload.amount_paid,
          orderId: `ORDER_${orderId}`,
          redirectUrl: `${window.location.origin}/payment-success`,
        };

        console.log(
          "Payment Payload:",
          JSON.stringify(paymentPayload, null, 2)
        );

        // Kiểm tra dữ liệu thanh toán
        if (
          !paymentPayload.amount ||
          !paymentPayload.orderId ||
          !paymentPayload.redirectUrl
        ) {
          throw new Error(
            "Dữ liệu thanh toán không hợp lệ: " + JSON.stringify(paymentPayload)
          );
        }

        // Gọi API thanh toán
        const paymentResponse = await fetch(
          `${PAYMENT_API_URL}/payment/${selectedPayment}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Thêm token nếu API yêu cầu
            },
            body: JSON.stringify(paymentPayload),
          }
        );

        if (!paymentResponse.ok) {
          const paymentError = await paymentResponse.json();
          throw new Error(
            paymentError.error || "Không thể tạo liên kết thanh toán!"
          );
        }

        const { payUrl } = await paymentResponse.json();
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          throw new Error("Không nhận được payUrl từ server!");
        }
      } else {
        // COD: Xóa giỏ hàng và thông báo thành công
        clearCart();
        toast.success("Đặt hàng thành công!");
        setShowPaymentModal(false);
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi xử lý thanh toán!");
      console.error("Place order error:", err);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-[150px]">
      {/* Thông tin vận chuyển */}
      <div className="lg:col-span-2 space-y-6">
        {/* ... (Phần form thông tin không đổi) ... */}
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Thông tin vận chuyển</h2>
          <h2>Chọn từ sổ địa chỉ</h2>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1">Họ tên *</div>
              <Input
                name="recipient_name"
                value={formData.recipient_name}
                onChange={handleFormChange}
                className="rounded-full px-4 py-6"
                placeholder="Họ tên"
              />
            </div>
            <div>
              <div className="mb-1">Số điện thoại *</div>
              <Input
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleFormChange}
                className="rounded-full px-4 py-6"
                placeholder="Số điện thoại"
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="mb-1">Email</div>
            <Input
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="rounded-full px-4 py-6"
              placeholder="Email"
            />
          </div>
          <div className="mt-2">
            <div className="mb-1">Địa chỉ *</div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleFormChange}
                className="rounded-full px-4 py-6"
                placeholder="Nhập địa chỉ"
              />
              <Input
                className="rounded-full px-4 py-6"
                placeholder="Chọn tỉnh/thành phố"
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="mb-1">Ghi chú</div>
            <Input
              name="note"
              value={formData.note}
              onChange={handleFormChange}
              className="rounded-full px-4 py-6"
              placeholder="Ghi chú"
            />
          </div>
        </div>
        <div className="relative h-[1px] w-full my-5 bg-neutral-900/10 max-lg:hidden"></div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox checked={callOther} onCheckedChange={setCallOther} />
            <span>Gọi người khác nhận hàng (nếu có)</span>
          </label>
          <div className="relative h-[1px] w-full my-5 bg-neutral-900/10 max-lg:hidden"></div>
          <label className="flex items-center space-x-2">
            <Checkbox checked={vatInvoice} onCheckedChange={setVatInvoice} />
            <span>Xuất hoá đơn VAT</span>
          </label>
          <div className="relative h-[1px] w-full my-5 bg-neutral-900/10 max-lg:hidden"></div>
        </div>

        <h2 className="text-xl font-bold pt-6">Hình thức thanh toán</h2>
        <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 border p-3 rounded-xl">
              <RadioGroupItem value="cod" />
              <img src="/cod.avif" alt="" className="w-[44px] h-[44px]" />
              <span>Thanh toán khi nhận hàng</span>
            </Label>
            <Label className="flex items-center space-x-2 border p-3 rounded-xl">
              <RadioGroupItem value="momo" />
              <img src="/momoPay.avif" alt="" className="w-[44px] h-[44px]" />
              <span>Thanh toán qua Momo (Sandbox)</span>
            </Label>
            <Label className="flex items-center space-x-2 border p-3 rounded-xl">
              <RadioGroupItem value="zalopay" />
              <img src="/zaloPay.avif" alt="" className="w-[44px] h-[44px]" />
              <span>Thanh toán qua ZaloPay (Sandbox)</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Giỏ hàng */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Giỏ hàng</h2>
          <Button
            variant="ghost"
            className="text-red-500"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Xóa tất cả
          </Button>
        </div>

        {/* ================================================== */}
        {/* PHẦN THAY ĐỔI LOGIC GIỎ HÀNG BẮT ĐẦU TỪ ĐÂY */}
        {/* ================================================== */}

        {cart.map((p) => (
          // THAY ĐỔI 1: key={p.cart_id} -> key={p.variant_id}
          <div key={p.variant_id} className="flex items-center space-x-4">
            <img
              src={p.image}
              alt={p.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.color} / {p.size}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  // THAY ĐỔI 2: p.cart_id -> p.variant_id
                  onClick={() => removeFromCart(p.variant_id)}
                >
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  // THAY ĐỔI 3: p.cart_id -> p.variant_id và bỏ Math.max
                  onClick={() => updateCartQuantity(p.variant_id, p.qty - 1)}
                >
                  -
                </Button>
                <span>{p.qty}</span>
                <Button
                  variant="outline"
                  size="sm"
                  // THAY ĐỔI 4: p.cart_id -> p.variant_id
                  onClick={() => updateCartQuantity(p.variant_id, p.qty + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <p className="font-semibold">
              {(p.price * p.qty).toLocaleString()}đ
            </p>
          </div>
        ))}

        {/* ================================================== */}
        {/* PHẦN THAY ĐỔI LOGIC GIỎ HÀNG KẾT THÚC TẠI ĐÂY */}
        {/* ================================================== */}

        <Separator />

        {/* Voucher */}
        <div className="flex space-x-2">
          <Input placeholder="Nhập mã giảm giá" />
          <Button variant="outline">Áp dụng</Button>
        </div>

        <Separator />

        {/* Tổng tiền */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{total.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span>20,000đ</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Tổng cộng</span>
            <span>{(total + 20000).toLocaleString()}đ</span>
          </div>
        </div>

        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-black text-white"
              disabled={cart.length === 0 || !isFormValid()}
              onClick={() => setShowPaymentModal(true)}
            >
              ĐẶT HÀNG
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận đặt hàng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Tổng tiền: <strong>{(total + 20000).toLocaleString()}đ</strong>
              </p>
              <p>
                Phương thức thanh toán:{" "}
                <strong>
                  {selectedPayment === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : selectedPayment === "momo"
                    ? "Momo (Sandbox)"
                    : "ZaloPay (Sandbox)"}
                </strong>
              </p>
              <Button
                onClick={handlePlaceOrder}
                className="w-full"
                disabled={paymentLoading}
              >
                {paymentLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
