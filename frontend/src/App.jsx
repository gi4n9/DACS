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
  const userBtnRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <BrowserRouter>
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
          <Route path="/product/:id" element={<ProductPage />} />
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
        onLoginSuccess={(u) => setUser(u)}
      />

      <Toaster className="mr-10" position="bottom-right" richColors />
    </BrowserRouter>
  );
}

export default App;
