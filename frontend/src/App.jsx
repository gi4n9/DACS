import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { CartProvider, useCart } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AuthModal from "@/components/AuthModal";
import Layout from "@/components/Layout";
import Chat from "@/components/ChatBox";
import { Toaster } from "sonner";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import ProductPage from "@/pages/Product/ProductPage";
import CategoryPage from "@/pages/Collection/CategoryPage";
import ProfilePage from "@/pages/ProfilePage";
import Cart from "@/pages/Collection/Cart";

// (Các import component/trang khác giữ nguyên)
import AccountInfo from "./components/AccountInfo";
import OrderHistory from "./components/OrderHistory";
import AddressBook from "./components/AddressBook";
import WishlistPage from "@/pages/WishlistPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";

const API_URL = import.meta.env.VITE_API_URL;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Component con
const AppLayout = ({
  user,
  token,
  setToken,
  setUser,
  authOpen,
  setAuthOpen,
  userBtnRef,
}) => {
  const { clearCart } = useCart();

  // --- CẬP NHẬT: handleLogout ĐỂ XÓA CẢ 2 TOKEN ---
  const handleLogout = useCallback(() => {
    document.cookie = "token=; path=/; maxAge=0"; // Xóa accessToken
    document.cookie = "refreshToken=; path=/; maxAge=0"; // Xóa refreshToken
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    setToken(null);
    clearCart();
  }, [clearCart, setToken, setUser]);

  // --- CẬP NHẬT: handleLoginSuccess ĐỂ NHẬN 2 TOKEN ---
  const handleLoginSuccess = useCallback(
    (userData, newAccessToken, newRefreshToken) => {
      console.log("Login success, setting tokens...");

      // 1. Set Access Token (Token chính)
      document.cookie = `token=${newAccessToken}; path=/; maxAge=86400; SameSite=Strict; Secure`;

      // 2. Set Refresh Token (nếu có)
      if (newRefreshToken) {
        // (Thời gian refreshToken thường dài hơn, ví dụ 7 ngày)
        document.cookie = `refreshToken=${newRefreshToken}; path=/; maxAge=604800; SameSite=Strict; Secure`;
      }

      // 3. Cập nhật State và LocalStorage
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newAccessToken); // State 'token' vẫn là accessToken
      setUser(userData);
      setAuthOpen(false);
    },
    [setToken, setUser, setAuthOpen]
  );

  return (
    <>
      <Routes>
        {/* a. CÁC ROUTE CÓ LAYOUT (Giữ nguyên) */}
        <Route
          element={
            <Layout
              openAuth={() => setAuthOpen(true)}
              userBtnRef={userBtnRef}
              user={user}
              onLogout={handleLogout} // Dùng hàm logout mới
            />
          }
        >
          {/* ... (Các route bên trong giữ nguyên) ... */}
          <Route path="/" element={<HomePage />} />
          <Route path="/:slug" element={<CategoryPage />} />
          <Route
            path="/product/:id"
            element={
              <ProductPage user={user} openAuth={() => setAuthOpen(true)} />
            }
          />
          <Route
            path="/profile"
            element={
              <ProfilePage user={user} openAuth={() => setAuthOpen(true)} />
            }
          >
            <Route index element={<AccountInfo />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="addresses" element={<AddressBook />} />
            <Route path="wishlist" element={<WishlistPage />} />
          </Route>
          <Route
            path="/cart"
            element={<Cart user={user} openAuth={() => setAuthOpen(true)} />}
          />
          <Route
            path="/payment-success"
            element={<div className="mt-[150px]">Thanh toán thành công!</div>}
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* b. CÁC ROUTE KHÔNG CÓ LAYOUT (Giữ nguyên) */}
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

        {/* Cập nhật route callback để truyền hàm login mới */}
        <Route
          path="/auth/callback"
          element={<AuthCallbackPage onLoginSuccess={handleLoginSuccess} />}
        />
      </Routes>

      <Chat />

      {/* Cập nhật AuthModal để truyền hàm login mới */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        anchorRef={userBtnRef}
        onLoginSuccess={handleLoginSuccess} // Truyền hàm login mới
      />

      <Toaster className="mr-10" position="bottom-right" richColors />
    </>
  );
};

// --- CẬP NHẬT: function App() ---
function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  // State 'token' này sẽ luôn là 'accessToken'
  const [token, setToken] = useState(getCookie("token"));

  const userBtnRef = useRef(null);

  // useEffect fetchUser (Giữ nguyên)
  // Nó chỉ cần 'token' (accessToken) để fetch user, điều này là đúng
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        console.log("No token found in cookie");
        setUser(null);
        localStorage.removeItem("user");
        return;
      }
      try {
        console.log("Calling /api/users/me with token:", token);
        const response = await axios.get(`${API_URL}/api/users/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const userData = response.data.data;
        if (userData?.user_id) {
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
        } else {
          throw new Error("Không nhận được user_id từ server");
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        // Xóa cả 2 cookie nếu token hỏng
        document.cookie = "token=; path=/; maxAge=0";
        document.cookie = "refreshToken=; path=/; maxAge=0";
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <BrowserRouter>
      <CartProvider user={user} token={token}>
        <WishlistProvider user={user} token={token}>
          <AppLayout
            user={user}
            token={token}
            setToken={setToken}
            setUser={setUser}
            authOpen={authOpen}
            setAuthOpen={setAuthOpen}
            userBtnRef={userBtnRef}
          />
        </WishlistProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
