import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { CartProvider, useCart } from "@/context/CartContext";
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
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";

const API_URL = import.meta.env.VITE_API_URL;

// Hàm lấy token từ cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getCookie("token"));
  const userBtnRef = useRef(null);
  //!! Lưu ý: Lấy 'clearCart' từ 'useCart' ở đây sẽ gây lỗi
  //!! vì 'App' không nằm trong 'CartProvider'.
  //!! 'handleLogout' sẽ cần lấy 'clearCart' từ context bên trong.

  // Lấy thông tin user từ API /api/users/me khi token thay đổi
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
        console.log("Response from /api/users/me:", response.data);
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
        Toaster.error(
          "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
      }
    };

    fetchUser();
  }, [token]);

  // Component con để xử lý Logout (vì cần access useCart)
  const AppLayout = () => {
    const { clearCart } = useCart();

    const handleLogout = useCallback(() => {
      document.cookie = "token=; path=/; maxAge=0";
      localStorage.removeItem("user");
      localStorage.removeItem("cart");
      setUser(null);
      setToken(null);
      clearCart(); // Giờ có thể gọi clearCart
    }, [clearCart]);

    const handleLoginSuccess = useCallback((userData, newToken) => {
      console.log("Login success, setting token:", newToken);
      document.cookie = `token=${newToken}; path=/; maxAge=86400; SameSite=Strict; Secure`;
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setAuthOpen(false);
    }, []);

    return (
      <>
        <Routes>
          <Route
            element={
              <Layout
                openAuth={() => setAuthOpen(true)}
                userBtnRef={userBtnRef}
                user={user}
                onLogout={handleLogout} // Dùng handleLogout từ context
              />
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/:slug" element={<CategoryPage />} />
            <Route
              path="/product/:id"
              element={
                <ProductPage user={user} openAuth={() => setAuthOpen(true)} />
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/cart"
              element={<Cart user={user} openAuth={() => setAuthOpen(true)} />}
            />

            {/* THAY ĐỔI ROUTE NÀY */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        <Chat />

        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          anchorRef={userBtnRef}
          onLoginSuccess={handleLoginSuccess}
        />

        <Toaster className="mr-10" position="bottom-right" richColors />
      </>
    );
  };

  return (
    <BrowserRouter>
      {/* CartProvider bao bọc AppLayout */}
      <CartProvider user={user} token={token}>
        <AppLayout />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
