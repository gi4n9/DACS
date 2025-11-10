import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  User,
  Gift,
  ClipboardList,
  DollarSign,
  Ticket,
  BookMarked,
  HelpCircle,
  LogOut,
  Heart, // <-- 1. THÊM MỚI ICON HEART
} from "lucide-react";

// (Giữ nguyên component SidebarLink)
const SidebarLink = ({ icon: Icon, text, to, active = false }) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
      active ? "bg-black text-white" : "hover:bg-gray-100"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} />
      <span className="font-medium text-sm">{text}</span>
    </div>
    <span className="text-gray-400">&rarr;</span>
  </Link>
);

export default function ProfilePage() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="container mx-auto p-6 mt-[120px] max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="w-full lg:w-1/4 space-y-2">
          <SidebarLink
            icon={User}
            text="Thông tin tài khoản"
            to="/profile"
            active={currentPath === "/profile"}
          />
          <SidebarLink icon={Gift} text="Giới thiệu bạn bè" to="#" />
          <SidebarLink
            icon={ClipboardList}
            text="Lịch sử đơn hàng"
            to="/profile/orders"
            active={currentPath === "/profile/orders"}
          />
          <SidebarLink icon={DollarSign} text="Lịch sử CoolCash" to="#" />
          <SidebarLink icon={Ticket} text="Ví voucher" to="#" />
          <SidebarLink
            icon={BookMarked}
            text="Sổ địa chỉ"
            to="/profile/addresses"
            active={currentPath === "/profile/addresses"}
          />

          {/* --- 2. THAY ĐỔI DÒNG NÀY --- */}
          <SidebarLink
            icon={Heart} // <-- Đổi Icon
            text="Sản phẩm ưa thích" // <-- Đổi Tên
            to="/profile/wishlist" // <-- Đổi Link
            active={currentPath === "/profile/wishlist"} // <-- Đổi Link
          />
          {/* --- KẾT THÚC THAY ĐỔI --- */}

          <SidebarLink icon={HelpCircle} text="Chính sách & Câu hỏi" to="#" />
          <SidebarLink
            icon={LogOut}
            text="Đăng xuất"
            to="#" // (Nút này nên xử lý = 1 hàm onLogout từ App.jsx)
          />
        </aside>

        <main className="w-full lg:w-3/4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
