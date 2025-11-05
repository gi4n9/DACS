import React, { useState, useEffect } from "react";
import addressData from "@/data/address.json"; // Import file JSON local
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- CÀI ĐẶT API ---
const API_URL = import.meta.env.VITE_API_URL;

// Hàm lấy token (Không đổi)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export default function Cart({ user, openAuth }) {
  const { cart, removeFromCart, clearCart, updateCartQuantity } = useCart();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [paymentLoading, setPaymentLoading] = useState(false);

  // State for Form (Không đổi)
  const [formData, setFormData] = useState({
    recipient_name: "",
    recipient_phone: "",
    email: "",
    street: "",
    province: "",
    district: "",
    ward: "",
    note: "",
  });

  // State for Address (Không đổi)
  const [provinces, setProvinces] = useState(addressData || []);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [callOther, setCallOther] = useState(false);
  const [vatInvoice, setVatInvoice] = useState(false);
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const navigate = useNavigate();

  // (useEffect tải địa chỉ đã bị xóa vì dùng import)

  // Cập nhật dữ liệu form cho các ô Input thường (Không đổi)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logic xử lý Select (Không đổi)
  const handleProvinceChange = (value) => {
    const selected = provinces.find((p) => String(p.Id) === value);
    setFormData((prev) => ({
      ...prev,
      province: selected ? selected.Name : "",
      district: "",
      ward: "",
    }));
    setDistricts(selected ? selected.Districts : []);
    setWards([]);
  };

  const handleDistrictChange = (value) => {
    const selected = districts.find((d) => String(d.Id) === value);
    setFormData((prev) => ({
      ...prev,
      district: selected ? selected.Name : "",
      ward: "",
    }));
    setWards(selected ? selected.Wards : []);
  };

  const handleWardChange = (value) => {
    const selected = wards.find((w) => String(w.Id) === value);
    setFormData((prev) => ({
      ...prev,
      ward: selected ? selected.Name : "",
    }));
  };

  // Kiểm tra form hợp lệ (Không đổi)
  const isFormValid = () => {
    return (
      formData.recipient_name.trim() !== "" &&
      formData.recipient_phone.trim() !== "" &&
      formData.street.trim() !== "" &&
      formData.province !== "" &&
      formData.district !== "" &&
      formData.ward !== ""
    );
  };

  // --- HÀM XỬ LÝ ĐẶT HÀNG (ĐÃ CẬP NHẬT) ---
  const handlePlaceOrder = async () => {
    const token = getCookie("token");
    // 1. Kiểm tra (Không đổi)
    if (!user || !user.user_id || !token) {
      toast.error("Vui lòng đăng nhập để đặt hàng!");
      if (typeof openAuth === "function") openAuth();
      return;
    }
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    if (!isFormValid()) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setPaymentLoading(true);
    try {
      // 2. Tạo payload cho đơn hàng (Không đổi)
      const orderPayload = {
        fullName: formData.recipient_name,
        phone: formData.recipient_phone,
        street: formData.street,
        ward: formData.ward,
        district: formData.district,
        province: formData.province,
        method: selectedPayment,
        provider: null,
      };

      // 3. Gọi API /orders/checkout (Không đổi)
      const orderResponse = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "Lỗi khi tạo đơn hàng");
      }
      const orderData = await orderResponse.json();

      // --- PHẦN LOGIC MỚI BẮT ĐẦU TỪ ĐÂY ---

      // 4. Lấy dữ liệu từ response (theo yêu cầu mới)
      const newOrder = orderData.data;
      if (!newOrder || !newOrder.code || !newOrder.items) {
        throw new Error("Response từ /checkout không hợp lệ");
      }

      const orderCode = newOrder.code; // Lấy `code` (ví dụ: "FSH-2025-...")
      const orderItems = newOrder.items; // Lấy mảng `items`

      // 5. Kiểm tra phương thức thanh toán
      if (selectedPayment === "momo" || selectedPayment === "zalopay") {
        // 5a. Tạo `userInfo` từ form
        const userInfo = {
          fullName: formData.recipient_name,
          email: formData.email, // Lấy email từ form
          phone: formData.recipient_phone,
        };

        // 5b. Tạo payload cho API MoMo (theo yêu cầu mới)
        const paymentPayload = {
          orderId: orderCode,
          userInfo: userInfo,
          items: orderItems,
        };

        // 5c. Gọi API thanh toán mới
        const paymentResponse = await fetch(
          `${API_URL}/api/payments/${selectedPayment}/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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

        const paymentData = await paymentResponse.json();

        // 5d. Đọc `paymentUrl` từ `data.paymentUrl` (theo response mới)
        if (paymentData.status === true && paymentData.data.paymentUrl) {
          const paymentUrl = paymentData.data.paymentUrl;
          clearCart(); // Xóa giỏ hàng
          window.location.href = paymentUrl; // Chuyển hướng
        } else {
          throw new Error("Không nhận được paymentUrl từ server!");
        }
      } else {
        // 6. Xử lý COD (Không đổi)
        clearCart();
        toast.success("Đặt hàng thành công!");
        setShowPaymentModal(false);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi xử lý thanh toán!");
      console.error("Place order error:", err);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[150px]">
      {/* Cột 1: Thông tin vận chuyển & Thanh toán */}
      <div className="lg:col-span-1 space-y-6">
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
                onChange={handleInputChange}
                className="rounded-full px-4 py-6"
                placeholder="Họ tên"
              />
            </div>
            <div>
              <div className="mb-1">Số điện thoại *</div>
              <Input
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleInputChange}
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
              onChange={handleInputChange}
              className="rounded-full px-4 py-6"
              placeholder="Email"
            />
          </div>

          {/* Phần JSX Địa chỉ (Đọc từ file JSON) */}
          <div className="mt-2">
            <div className="mb-1">Địa chỉ *</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Tỉnh/Thành phố */}
              <Select onValueChange={handleProvinceChange}>
                <SelectTrigger className="rounded-full px-4 py-6 w-full">
                  <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.Id} value={String(p.Id)}>
                      {p.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quận/Huyện */}
              <Select
                onValueChange={handleDistrictChange}
                disabled={!districts.length}
              >
                <SelectTrigger className="rounded-full px-4 py-6 w-full">
                  <SelectValue placeholder="Chọn Quận/Huyện" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.Id} value={String(d.Id)}>
                      {d.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Phường/Xã */}
              <Select onValueChange={handleWardChange} disabled={!wards.length}>
                <SelectTrigger className="rounded-full px-4 py-6 w-full">
                  <SelectValue placeholder="Chọn Phường/Xã" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w.Id} value={String(w.Id)}>
                      {w.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Số nhà, tên đường */}
              <Input
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="rounded-full px-4 py-6"
                placeholder="Số nhà, tên đường"
              />
            </div>
          </div>

          <div className="mt-2">
            <div className="mb-1">Ghi chú</div>
            <Input
              name="note"
              value={formData.note}
              onChange={handleInputChange}
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

      {/* Cột 2: Giỏ hàng & Tổng kết */}
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

        {cart.map((p) => (
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
                  onClick={() => removeFromCart(p.variant_id)}
                >
                  Xóa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateCartQuantity(p.variant_id, p.qty - 1)}
                >
                  -
                </Button>
                <span>{p.qty}</span>
                <Button
                  variant="outline"
                  size="sm"
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

        <Separator />

        <div className="flex space-x-2">
          <Input placeholder="Nhập mã giảm giá" />
          <Button variant="outline">Áp dụng</Button>
        </div>

        <Separator />

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
