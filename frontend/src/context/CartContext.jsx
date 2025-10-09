import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const CartContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export function CartProvider({ children, user, token }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Đồng bộ giỏ hàng từ server khi đăng nhập
  useEffect(() => {
    const fetchCart = async () => {
      if (user?.user_id && token) {
        try {
          const response = await axios.get(
            `${API_URL}/api/cart/${user.user_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const serverCart = response.data.data || [];
          // Ánh xạ dữ liệu từ server sang định dạng cart
          const mappedCart = serverCart.map((item) => ({
            cart_id: item.cart_id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: item.product_name,
            color: item.color_name,
            size: item.size_name,
            price: item.price,
            qty: item.quantity,
            image: item.variant_image || item.product_image,
          }));
          setCart(mappedCart);
          localStorage.setItem("cart", JSON.stringify(mappedCart));
        } catch (error) {
          console.error("Lỗi khi tải giỏ hàng từ server:", error);
          toast.error("Không thể tải giỏ hàng từ server!");
          setCart([]);
          localStorage.setItem("cart", JSON.stringify([]));
        }
      } else {
        setCart([]);
        localStorage.setItem("cart", JSON.stringify([]));
      }
    };
    fetchCart();
  }, [user, token]);

  // Thêm vào giỏ
  const addToCart = async (product) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return false;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/cart/${user.user_id}`,
        {
          productId: product.product_id,
          variantId: product.variant_id,
          quantity: product.qty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Giả sử API trả về item mới được thêm
      const newItem = response.data.data || {
        cart_id: Date.now(), // Fallback nếu API không trả về cart_id
        product_id: product.product_id,
        variant_id: product.variant_id,
        name: product.name,
        color: product.color,
        size: product.size,
        price: product.price,
        qty: product.qty,
        image: product.image,
      };

      setCart((prev) => {
        const exist = prev.find(
          (p) =>
            p.variant_id === product.variant_id &&
            p.size === product.size &&
            p.color === product.color
        );

        if (exist) {
          return prev.map((p) =>
            p.variant_id === product.variant_id &&
            p.size === product.size &&
            p.color === product.color
              ? { ...p, qty: p.qty + product.qty }
              : p
          );
        }
        return [...prev, newItem];
      });

      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      return true;
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng trên server:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
      return false;
    }
  };

  // Xóa một sản phẩm
  const removeFromCart = async (cart_id) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng!");
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/cart/${user.user_id}/item?cart_id=${cart_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCart((prev) => prev.filter((p) => p.cart_id !== cart_id));
      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng trên server:", error);
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng!");
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateCartQuantity = async (cart_id, quantity) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
      return false;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/cart/${user.user_id}`,
        {
          cartId: cart_id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedItem = response.data.data;
      setCart((prev) =>
        prev.map((p) =>
          p.cart_id === cart_id
            ? {
                ...p,
                qty: updatedItem.quantity,
                price: updatedItem.price,
                image: updatedItem.variant_image || p.image,
              }
            : p
        )
      );

      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success("Đã cập nhật số lượng sản phẩm!");
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
      toast.error("Không thể cập nhật số lượng sản phẩm!");
      return false;
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!user?.user_id || !token) {
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/cart/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      toast.success("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
      toast.error("Không thể xóa toàn bộ giỏ hàng!");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
