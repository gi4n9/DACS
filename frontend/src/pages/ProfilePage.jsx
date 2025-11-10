import { Link, Outlet, useLocation } from "react-router-dom";
import {
  User,
  Gift,
  ClipboardList,
  DollarSign,
  Ticket,
  BookMarked,
  MessageSquare,
  HelpCircle,
  LogOut,
} from "lucide-react";

/**
 * Component SidebarLink (Đã cập nhật)
 * - Dùng <Link> thay vì <a>
 * - Dùng `to` thay vì `href`
 * - Bỏ `active` prop (sẽ xử lý bên dưới)
 */
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

/**
 * Trang ProfilePage (Layout)
 * - Chỉ còn chứa Sidebar và <Outlet>
 * - Toàn bộ logic form ĐÃ BỊ XÓA
 */
export default function ProfilePage() {
  // Hook để lấy đường dẫn hiện tại (ví dụ: /profile/orders)
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="container mx-auto p-6 mt-[120px] max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* --- CỘT TRÁI: SIDEBAR MENU --- */}
        <aside className="w-full lg:w-1/4 space-y-2">
          {/* Cập nhật `to` và `active` */}
          <SidebarLink
            icon={User}
            text="Thông tin tài khoản"
            to="/profile"
            active={currentPath === "/profile"}
          />
          <SidebarLink
            icon={Gift}
            text="Giới thiệu bạn bè"
            to="#"
            active={currentPath === "/profile/refer"} // (Ví dụ)
          />
          <SidebarLink
            icon={ClipboardList}
            text="Lịch sử đơn hàng"
            to="/profile/orders" // <-- Đường dẫn mới
            active={currentPath === "/profile/orders"} // <-- Active state
          />
          <SidebarLink icon={DollarSign} text="Lịch sử CoolCash" to="#" />
          <SidebarLink icon={Ticket} text="Ví voucher" to="#" />
          <SidebarLink
            icon={BookMarked}
            text="Sổ địa chỉ"
            to="/profile/addresses" // <-- THAY ĐỔI
            active={currentPath === "/profile/addresses"} // <-- THAY ĐỔI
          />
          <SidebarLink
            icon={MessageSquare}
            text="Đánh giá và phản hồi"
            to="/profile/reviews" // <-- THAY ĐỔI
            active={currentPath === "/profile/reviews"} // <-- THAY ĐỔI
          />
          <SidebarLink icon={HelpCircle} text="Chính sách & Câu hỏi" to="#" />
          <SidebarLink
            icon={LogOut}
            text="Đăng xuất"
            to="#" // (Nút này nên xử lý = 1 hàm onLogout từ App.jsx)
          />
        </aside>

        {/* --- CỘT PHẢI: NỘI DUNG CHÍNH --- */}
        <main className="w-full lg:w-3/4">
          {/* Outlet sẽ render <AccountInfo /> hoặc <OrderHistory /> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
