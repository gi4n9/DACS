import React, { useState, useEffect } from "react";
import addressData from "@/data/address.json";
import { getUserAddresses } from "@/lib/api";
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

// --- CÀI ĐẶT API ---
const API_URL = import.meta.env.VITE_API_URL;

// --- HÀM HELPER ---

// Lấy token
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Lấy user an toàn từ localStorage (chống lỗi "undefined")
const getStoredUser = () => {
  const storedUserString = localStorage.getItem("user");
  if (!storedUserString || storedUserString === "undefined") {
    return null;
  }
  try {
    return JSON.parse(storedUserString);
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// --- COMPONENT CHÍNH ---
export default function Cart({ user, openAuth }) {
  const { cart, removeFromCart, clearCart, updateCartQuantity } = useCart();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod"); // Mặc định là 'cod'
  const [paymentLoading, setPaymentLoading] = useState(false);

  // State for Form (Tự động điền thông tin user)
  const [formData, setFormData] = useState({
    recipient_name: user?.full_name || "",
    recipient_phone: user?.phone || "",
    email: user?.email || "",
    street: "",
    province: "",
    district: "",
    ward: "",
    note: "",
  });

  // State for Address
  const [userAddresses, setUserAddresses] = useState(
    getStoredUser()?.addresses || []
  ); // Sổ địa chỉ
  const [provinces, setProvinces] = useState(addressData || []); // Tỉnh (từ file)
  const [districts, setDistricts] = useState([]); // Huyện
  const [wards, setWards] = useState([]); // Xã

  const [callOther, setCallOther] = useState(false);
  const [vatInvoice, setVatInvoice] = useState(false);
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy token
    const token = getCookie("token");

    if (user && token) {
      // 1. Cập nhật form (Giữ nguyên logic cũ)
      setFormData((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || user.full_name || "",
        recipient_phone: prev.recipient_phone || user.phone || "",
        email: prev.email || user.email || "",
      }));

      // 2. Tải sổ địa chỉ TỪ API (Đã refactor)
      const fetchAddresses = async () => {
        try {
          // Gọi hàm mới từ api.js
          const res = await getUserAddresses(token);

          // Cập nhật state với response từ API
          if (res.status === true && res.data.addresses) {
            setUserAddresses(res.data.addresses);
          } else {
            // Nếu API trả về status: false
            setUserAddresses([]);
            if (res.message) toast.error(res.message);
          }
        } catch (err) {
          // Dành cho các lỗi mạng (network error)
          console.error("Lỗi khi tải sổ địa chỉ:", err);
          setUserAddresses([]);
          toast.error("Lỗi mạng, không thể tải sổ địa chỉ.");
        }
      };

      fetchAddresses(); // Gọi hàm
    } else {
      setUserAddresses([]);
    }
  }, [user]);

  // Cập nhật input thường
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Logic Dropdown Địa chỉ (Từ file JSON) ---

  const handleProvinceChange = (value) => {
    // value = p.Id
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
    // value = d.Id
    const selected = districts.find((d) => String(d.Id) === value);
    setFormData((prev) => ({
      ...prev,
      district: selected ? selected.Name : "",
      ward: "",
    }));
    setWards(selected ? selected.Wards : []);
  };

  const handleWardChange = (value) => {
    // value = w.Id
    const selected = wards.find((w) => String(w.Id) === value);
    setFormData((prev) => ({
      ...prev,
      ward: selected ? selected.Name : "",
    }));
  };

  // --- Logic Sổ Địa Chỉ ---

  const handleSelectAddress = (addressId) => {
    const selected = userAddresses.find((addr) => addr._id === addressId);
    if (!selected) return;

    // 1. Điền thông tin vào form
    setFormData({
      ...formData,
      recipient_name: selected.fullName,
      recipient_phone: selected.phone,
      street: selected.street,
      province: selected.province,
      district: selected.district,
      ward: selected.ward,
    });

    // 2. Kích hoạt logic để điền các dropdown
    const selectedProvince = provinces.find(
      (p) => p.Name === selected.province
    );
    if (selectedProvince) {
      const selectedDistricts = selectedProvince.Districts || [];
      setDistricts(selectedDistricts);

      const selectedDistrict = selectedDistricts.find(
        (d) => d.Name === selected.district
      );
      if (selectedDistrict) {
        setWards(selectedDistrict.Wards || []);
      }
    }
  };

  // --- Validation & Đặt hàng ---

  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      formData.recipient_name.trim() !== "" &&
      formData.recipient_phone.trim() !== "" &&
      formData.email.trim() !== "" &&
      emailRegex.test(formData.email) &&
      formData.street.trim() !== "" &&
      formData.province !== "" &&
      formData.district !== "" &&
      formData.ward !== ""
    );
  };

  const handlePlaceOrder = async () => {
    const token = getCookie("token");
    // 1. Kiểm tra
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
      toast.error(
        "Vui lòng điền đầy đủ thông tin (Họ tên, SĐT, Email, Địa chỉ)!"
      );
      return;
    }
    if (!selectedPayment) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    setPaymentLoading(true);
    try {
      // 2. Tạo payload checkout (đã có email)
      const orderPayload = {
        fullName: formData.recipient_name,
        phone: formData.recipient_phone,
        email: formData.email,
        street: formData.street,
        ward: formData.ward,
        district: formData.district,
        province: formData.province,
        method: selectedPayment,
        provider: null,
      };

      // 3. Gọi API /orders/checkout
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

      // 4. Lấy dữ liệu (code, items)
      const newOrder = orderData.data;
      if (!newOrder || !newOrder.code || !newOrder.items) {
        throw new Error("Response từ /checkout không hợp lệ");
      }
      const orderCode = newOrder.code;
      const orderItems = newOrder.items;

      // 5. Kiểm tra phương thức
      if (selectedPayment === "momo" || selectedPayment === "zalopay") {
        // 5a. Tạo payload thanh toán
        const userInfo = {
          fullName: formData.recipient_name,
          email: formData.email,
          phone: formData.recipient_phone,
        };
        const paymentPayload = {
          orderId: orderCode,
          userInfo: userInfo,
          items: orderItems,
        };

        // 5b. Gọi API /payments/.../create
        const paymentResponse = await fetch(
          `${API_URL}/api/payments/${selectedPayment}/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentPayload), // Đã sửa lỗi typo
          }
        );

        if (!paymentResponse.ok) {
          const paymentError = await paymentResponse.json();
          throw new Error(
            paymentError.message || `Không thể tạo liên kết ${selectedPayment}!`
          );
        }

        const paymentData = await paymentResponse.json();

        // 5c. Chuyển hướng
        if (paymentData.status === true && paymentData.data.paymentUrl) {
          const paymentUrl = paymentData.data.paymentUrl;
          clearCart();
          window.location.href = paymentUrl;
        } else {
          throw new Error("Không nhận được paymentUrl từ server!");
        }
      } else {
        // 6. Xử lý COD
        clearCart();
        toast.success("Đặt hàng thành công! Kiểm tra email để xem chi tiết.");
        setShowPaymentModal(false);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message || "Lỗi khi xử lý đơn hàng!");
      console.error("Place order error:", err);
    } finally {
      setPaymentLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="max-w-8xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-[150px]">
      {/* Cột 1: Thông tin vận chuyển & Thanh toán */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Thông tin vận chuyển</h2>

          {/* Dropdown Sổ địa chỉ */}
          {userAddresses.length > 0 && (
            <Select onValueChange={handleSelectAddress}>
              <SelectTrigger className="w-[200px] rounded-full text-sm">
                <SelectValue placeholder="Chọn từ sổ địa chỉ" />
              </SelectTrigger>
              <SelectContent>
                {userAddresses.map((addr) => (
                  <SelectItem key={addr._id} value={addr._id}>
                    {addr.fullName} {addr.isDefault ? "(Mặc định)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
            <div className="mb-1">Email *</div>
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="rounded-full px-4 py-6"
              placeholder="Email"
            />
          </div>

          {/* JSX Địa chỉ (Từ file JSON) */}
          <div className="mt-2">
            <div className="mb-1">Địa chỉ *</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Tỉnh/Thành phố */}
              <Select
                onValueChange={handleProvinceChange}
                // Hiển thị giá trị đã chọn
                value={
                  provinces.find((p) => p.Name === formData.province)?.Id || ""
                }
              >
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
                // Hiển thị giá trị đã chọn
                value={
                  districts.find((d) => d.Name === formData.district)?.Id || ""
                }
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
              <Select
                onValueChange={handleWardChange}
                disabled={!wards.length}
                // Hiển thị giá trị đã chọn
                value={wards.find((w) => w.Name === formData.ward)?.Id || ""}
              >
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
                Tổng tiền: <b>{(total + 20000).toLocaleString()}đ</b>
              </p>
              <p>
                Phương thức thanh toán:{" "}
                <b>
                  {selectedPayment === "cod"
                    ? "Thanh toán khi nhận hàng"
                    : selectedPayment === "momo"
                    ? "Momo (Sandbox)"
                    : "ZaloPay (Sandbox)"}
                </b>
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
