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

const API_URL = import.meta.env.VITE_API_URL;
const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL;
const PROVINCES_API_URL = "https://provinces.open-api.vn/api/";

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

  // State for Address APIs (Không đổi)
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);

  const [callOther, setCallOther] = useState(false);
  const [vatInvoice, setVatInvoice] = useState(false);
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const navigate = useNavigate();

  // Fetch Provinces (Không đổi)
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${PROVINCES_API_URL}?depth=1`);
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Districts (Không đổi)
  useEffect(() => {
    if (selectedProvinceCode) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `${PROVINCES_API_URL}p/${selectedProvinceCode}?depth=2`
          );
          setDistricts(response.data.districts);
          setWards([]);
        } catch (error) {
          console.error("Lỗi khi tải danh sách quận/huyện:", error);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvinceCode]);

  // Fetch Wards (Không đổi)
  useEffect(() => {
    if (selectedDistrictCode) {
      const fetchWards = async () => {
        try {
          const response = await axios.get(
            `${PROVINCES_API_URL}d/${selectedDistrictCode}?depth=2`
          );
          setWards(response.data.wards);
        } catch (error) {
          console.error("Lỗi khi tải danh sách phường/xã:", error);
        }
      };
      fetchWards();
    }
  }, [selectedDistrictCode]);

  // Cập nhật dữ liệu form cho các ô Input thường (Không đổi)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logic xử lý component Select (Không đổi)
  const handleProvinceChange = (value) => {
    const selected = provinces.find((p) => p.code == value);
    setSelectedProvinceCode(value);
    setFormData((prev) => ({
      ...prev,
      province: selected ? selected.name : "",
      district: "",
      ward: "",
    }));
    setDistricts([]);
    setWards([]);
  };

  const handleDistrictChange = (value) => {
    const selected = districts.find((d) => d.code == value);
    setSelectedDistrictCode(value);
    setFormData((prev) => ({
      ...prev,
      district: selected ? selected.name : "",
      ward: "",
    }));
    setWards([]);
  };

  const handleWardChange = (value) => {
    const selected = wards.find((w) => w.code == value);
    setFormData((prev) => ({
      ...prev,
      ward: selected ? selected.name : "",
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

  // Xử lý đặt hàng (Không đổi)
  const handlePlaceOrder = async () => {
    const token = getCookie("token");
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

      console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

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

      const newOrder = orderData.data;
      if (!newOrder?._id) {
        throw new Error("Không nhận được thông tin đơn hàng sau khi tạo");
      }
      const orderId = newOrder._id;
      const amountToPay = newOrder.total;

      if (selectedPayment === "momo" || selectedPayment === "zalopay") {
        const paymentPayload = {
          amount: amountToPay,
          orderId: `ORDER_${orderId}`,
          redirectUrl: `${window.location.origin}/payment-success`,
        };
        const paymentResponse = await fetch(
          `${PAYMENT_API_URL}/payment/${selectedPayment}`,
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
        const { payUrl } = await paymentResponse.json();
        if (payUrl) {
          clearCart();
          window.location.href = payUrl;
        } else {
          throw new Error("Không nhận được payUrl từ server!");
        }
      } else {
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
    // ==================================================
    // THAY ĐỔI 1: Đổi lg:grid-cols-3 -> lg:grid-cols-2
    // ==================================================
    <div className="max-w-8xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[150px]">
      {/* ==================================================
        THAY ĐỔI 2: Đổi lg:col-span-2 -> lg:col-span-1
      ================================================== */}
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
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
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
                    <SelectItem key={d.code} value={d.code}>
                      {d.name}
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
                    <SelectItem key={w.code} value={w.code}>
                      {w.name}
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

      {/* Giỏ hàng (Cột này sẽ tự động chiếm 1 phần còn lại) */}
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
