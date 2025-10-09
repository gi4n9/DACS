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
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  // Hàm đồng bộ giỏ hàng từ server
  const fetchCart = async () => {
    if (!user?.user_id || !token) {
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      return;
    }

    setIsLoadingCart(true);
    try {
      const response = await axios.get(`${API_URL}/api/cart/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Server cart response:", response.data);
      const serverCart = response.data.data || [];
      // Ánh xạ dữ liệu, gọi API sản phẩm để lấy color_name và size_name
      const mappedCart = await Promise.all(
        serverCart.map(async (item) => {
          try {
            const productRes = await axios.get(
              `${API_URL}/api/products/${item.product_id}`
            );
            const productData = productRes.data.data.product;
            const variant =
              productData.variants.find(
                (v) => v.variant_id === item.variant_id
              ) || {};
            return {
              cart_id: item.cart_id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              name: item.product_name,
              color: variant.color_name || `Màu: ${item.color_id}`,
              size: variant.size_name || `Kích thước: ${item.size_id}`,
              price: item.price,
              qty: item.quantity,
              image: item.variant_image || item.product_image,
            };
          } catch (error) {
            console.error(
              `Lỗi khi lấy thông tin sản phẩm ${item.product_id}:`,
              error
            );
            return {
              cart_id: item.cart_id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              name: item.product_name,
              color: `Màu: ${item.color_id}`,
              size: `Kích thước: ${item.size_id}`,
              price: item.price,
              qty: item.quantity,
              image: item.variant_image || item.product_image,
            };
          }
        })
      );
      setCart(mappedCart);
      localStorage.setItem("cart", JSON.stringify(mappedCart));
      console.log("Mapped cart:", mappedCart);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ server:", error);
      toast.error("Không thể tải giỏ hàng từ server!");
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Đồng bộ giỏ hàng khi user hoặc token thay đổi
  useEffect(() => {
    fetchCart();
  }, [user, token]);

  // Thêm vào giỏ
  const addToCart = async (product) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return false;
    }

    try {
      // Cập nhật cart ngay để hiển thị tức thì
      setCart((prev) => {
        const exist = prev.find((p) => p.variant_id === product.variant_id);
        let newCart;
        if (exist) {
          newCart = prev.map((p) =>
            p.variant_id === product.variant_id
              ? { ...p, qty: p.qty + product.qty }
              : p
          );
        } else {
          newCart = [...prev, { ...product, cart_id: `temp_${Date.now()}` }];
        }
        localStorage.setItem("cart", JSON.stringify(newCart));
        console.log("Cart updated locally:", newCart);
        return newCart;
      });

      // Gửi yêu cầu thêm vào giỏ hàng bất đồng bộ
      axios
        .post(
          `${API_URL}/api/cart/${user.user_id}`,
          {
            productId: product.product_id,
            variantId: product.variant_id,
            quantity: product.qty,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          console.log("POST cart response:", response.data);
          // Cập nhật cart_id nếu API trả về
          if (response.data?.data?.cart_id) {
            setCart((prev) => {
              const newCart = prev.map((p) =>
                p.variant_id === product.variant_id &&
                p.cart_id.startsWith("temp_")
                  ? { ...p, cart_id: response.data.data.cart_id }
                  : p
              );
              localStorage.setItem("cart", JSON.stringify(newCart));
              console.log("Cart updated with POST response:", newCart);
              return newCart;
            });
          }
        })
        .catch((error) => {
          console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
          toast.error("Không thể đồng bộ giỏ hàng với server!");
        });

      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      return true;
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
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

    setIsLoadingCart(true);
    try {
      await axios.delete(
        `${API_URL}/api/cart/${user.user_id}/item?cart_id=${cart_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchCart();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng!");
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateCartQuantity = async (cart_id, quantity) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
      return false;
    }

    setIsLoadingCart(true);
    try {
      await axios.put(
        `${API_URL}/api/cart/${user.user_id}`,
        {
          cartId: cart_id,
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchCart();
      toast.success("Đã cập nhật số lượng sản phẩm!");
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
      toast.error("Không thể cập nhật số lượng sản phẩm!");
      return false;
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!user?.user_id || !token) {
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      return;
    }

    setIsLoadingCart(true);
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
    } finally {
      setIsLoadingCart(false);
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
        isLoadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
