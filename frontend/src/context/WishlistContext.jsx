import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

// --- API (sao chép từ api.js) ---
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL + "/api",
});

// Hàm lấy token từ cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
// --- Hết phần API ---

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children, token }) => {
  // `wishlist` sẽ lưu danh sách các *ID* sản phẩm
  const [wishlist, setWishlist] = useState(new Set());
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Tải wishlist khi user thay đổi
  useEffect(() => {
    const fetchWishlist = async () => {
      // Nếu không có token, set rỗng và dừng
      if (!token) {
        setWishlist(new Set());
        setWishlistProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Dùng `api` object đã định nghĩa sẵn ở đầu file
        const res = await api.get("/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // API response: { status, data: { products: [...] } }
        if (res.data.status && res.data.data.products) {
          const products = res.data.data.products || [];
          const productIds = products.map((p) => p.product_id);
          setWishlist(new Set(productIds));
          setWishlistProducts(products);
        } else {
          setWishlist(new Set());
          setWishlistProducts([]);
        }
      } catch (e) {
        console.error("Failed to load wishlist", e);
        setWishlist(new Set());
        setWishlistProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token]);

  // 2. (Đã xóa hàm isLiked, sẽ xử lý trong ProductCard)

  // 3. Hàm gọi API (Giữ nguyên)
  const toggleWishlist = async (productId) => {
    const token = getCookie("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để yêu thích sản phẩm!");
      return;
    }
    if (loading) return;

    setLoading(true);

    const oldWishlist = new Set(wishlist);
    const oldProducts = [...wishlistProducts];
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
        toast.info("Đã xóa khỏi danh sách yêu thích");
      } else {
        newWishlist.add(productId);
        toast.success("Đã thêm vào danh sách yêu thích!");
      }
      return newWishlist;
    });

    try {
      const res = await api.post(
        "/wishlist/toggle",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === true) {
        const newProducts = res.data.data.products || [];
        const newProductIds = newProducts.map((p) => p.product_id);

        setWishlist(new Set(newProductIds)); // Cập nhật Set ID
        setWishlistProducts(newProducts); // Cập nhật mảng sản phẩm

        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) {
          storedUser.wishlist = res.data.data;
          localStorage.setItem("user", JSON.stringify(storedUser));
        }
      } else {
        throw new Error(res.data.message || "Lỗi");
      }
    } catch (err) {
      // --- ROLLBACK CẢ 2 STATE NẾU LỖI ---
      setWishlist(oldWishlist);
      setWishlistProducts(oldProducts);

      toast.error("Thao tác thất bại, vui lòng thử lại.");
      console.error("Wishlist toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist, // Set các ID
        wishlistProducts, // Mảng các sản phẩm
        toggleWishlist,
        loadingWishlist: loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
