import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { cart, setCart } = useCart();
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);

  const removeFromCart = (variant_id, size, color) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.variant_id === variant_id &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  const updateQuantity = (variant_id, size, color, newQty) => {
    if (newQty <= 0) {
      removeFromCart(variant_id, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.variant_id === variant_id &&
        item.size === size &&
        item.color === color
          ? { ...item, qty: newQty }
          : item
      )
    );
  };

  return (
    <div className="max-w-8xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-3 gap-8 mt-[150px]">
      {/* Thông tin vận chuyển */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Thông tin vận chuyển</h2>
          <h2>Chọn từ sổ địa chỉ</h2>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1">Họ tên</div>
              <Input className="rounded-full px-4 py-6" placeholder="Họ tên" />
            </div>
            <div>
              <div className="mb-1">Số điện thoại</div>
              <Input
                className="rounded-full px-4 py-6"
                placeholder="Số điện thoại"
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="mb-1">Email</div>
            <Input className="rounded-full px-4 py-6" placeholder="Email" />
          </div>
          <div className="mt-2">
            <div className="mb-1">Địa chỉ</div>
            <div className="grid grid-cols-2 gap-4">
              <Input
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
            <Input className="rounded-full px-4 py-6" placeholder="Ghi chú" />
          </div>
        </div>
        <div className="relative h-[1px] w-full my-5 bg-neutral-900/10 max-lg:hidden"></div>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox /> <span>Gọi người khác nhận hàng (nếu có)</span>
          </label>
          <div className="relative h-[1px] w-full my-5 bg-neutral-900/10 max-lg:hidden"></div>
          <label className="flex items-center space-x-2">
            <Checkbox /> <span>Xuất hoá đơn VAT</span>
          </label>
          <div className="relative h-[1px] w-full my-5 bg-neutral-900/10 max-lg:hidden"></div>
        </div>

        <h2 className="text-xl font-bold pt-6">Hình thức thanh toán</h2>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 border p-3 rounded-xl">
            <input type="radio" name="payment" defaultChecked />
            <img src="/cod.avif" alt="" className="w-[44px] h-[44px]" />
            <span>Thanh toán khi nhận hàng</span>
          </label>
          <label className="flex items-center space-x-2 border p-3 rounded-xl">
            <input type="radio" name="payment" />
            <img src="/zaloPay.avif" alt="" className="w-[44px] h-[44px]" />
            <span>Thanh toán qua Zalo Pay</span>
          </label>
        </div>
      </div>

      {/* Giỏ hàng */}
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Giỏ hàng</h2>

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
                  onClick={() => removeFromCart(p.variant_id, p.size, p.color)}
                >
                  Xóa
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuantity(p.variant_id, p.size, p.color, p.qty - 1)
                  }
                >
                  -
                </Button>
                <span>{p.qty}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateQuantity(p.variant_id, p.size, p.color, p.qty + 1)
                  }
                >
                  +
                </Button>
              </div>
            </div>
            <p className="font-semibold">{p.price.toLocaleString()}đ</p>
          </div>
        ))}

        <Separator />

        {/* Voucher */}
        <div className="flex space-x-2">
          <Input placeholder="Nhập mã giảm giá" />
          <Button variant="outline">Áp dụng</Button>
        </div>

        <Separator />

        {/* Tổng tiền */}
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>
          <span>{total.toLocaleString()}đ</span>
        </div>

        <Button className="w-full bg-black text-white">ĐẶT HÀNG</Button>
      </div>
    </div>
  );
}
