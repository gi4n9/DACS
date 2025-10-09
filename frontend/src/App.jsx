import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import ProductPage from "@/pages/Product/ProductPage";
import CategoryPage from "@/pages/Collection/CategoryPage";
import Layout from "./components/Layout";
import Chat from "./components/ChatBox";
import AuthModal from "./components/AuthModal";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "sonner";
import Cart from "./pages/Collection/Cart";
import { CartProvider } from "./context/CartContext";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored || stored === "undefined" || stored === "null") {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    if (!stored || stored === "undefined" || stored === "null") {
      return null;
    }
    return stored;
  });
  const userBtnRef = useRef(null);

  const handleLogout = (clearCart) => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    setUser(null);
    setToken(null);
    clearCart();
  };

  return (
    <BrowserRouter>
      <CartProvider user={user} token={token}>
        <Routes>
          <Route
            element={
              <Layout
                openAuth={() => setAuthOpen(true)}
                userBtnRef={userBtnRef}
                user={user}
                onLogout={handleLogout}
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
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        <Chat />

        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          anchorRef={userBtnRef}
          onLoginSuccess={(u, t) => {
            setUser(u);
            setToken(t);
            localStorage.setItem("user", JSON.stringify(u));
            localStorage.setItem("token", t);
          }}
        />

        <Toaster className="mr-10" position="bottom-right" richColors />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
