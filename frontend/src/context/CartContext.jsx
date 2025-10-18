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

  // Hàm đồng bộ giỏ hàng từ server (API MỚI)
  const fetchCart = async () => {
    if (!user?.user_id || !token) {
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      return;
    }

    setIsLoadingCart(true);
    try {
      // 6.1 Lấy giỏ hàng (GET /cart)
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Server cart response (grouped):", response.data);
      const serverProducts = response.data.data.items || [];

      // API trả về giỏ hàng đã gộp theo sản phẩm
      // Cần "trải phẳng" (flatten) nó về mảng các variants để tương thích UI
      const flattenedCart = serverProducts.reduce((acc, product) => {
        product.variants.forEach((variant) => {
          acc.push({
            product_id: product.product_id,
            variant_id: variant.sku, // Dùng SKU làm variant_id (định danh chính)
            sku: variant.sku, // Thêm trường sku cho rõ ràng
            name: product.name,
            color: variant.color_name,
            size: variant.size_name,
            price: variant.price,
            qty: variant.quantity,
            image: variant.image || product.image, // Lấy ảnh variant, fallback ảnh product
          });
        });
        return acc;
      }, []);

      setCart(flattenedCart);
      localStorage.setItem("cart", JSON.stringify(flattenedCart));
      console.log("Mapped (flattened) cart:", flattenedCart);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ server:", error);
      toast.error("Không thể tải giỏ hàng từ server!");
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Đồng bộ giỏ hàng khi user hoặc token thay đổi (Không đổi)
  useEffect(() => {
    fetchCart();
  }, [user, token]);

  // Thêm vào giỏ (API MỚI)
  const addToCart = async (product, user, token) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return false;
    }

    // `product.variant_id` từ ProductPage giờ là SKU
    // Cập nhật cart ngay để hiển thị tức thì (Optimistic Update)
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
        // `product` đã có cấu trúc đúng, chỉ cần thêm vào
        newCart = [...prev, product];
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      console.log("Cart updated locally:", newCart);
      return newCart;
    });

    try {
      // 6.2 Thêm sản phẩm vào giỏ hàng (POST /cart/items)
      // `product.variant_id` chính là `sku`
      const response = await axios.post(
        `${API_URL}/api/cart/items`,
        {
          productId: product.product_id,
          sku: product.variant_id, // Gửi SKU
          quantity: product.qty,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("POST cart response:", response.data);

      // API mới không trả về cart_id, SKU là định danh
      // Không cần cập nhật cart_id 'temp_' nữa

      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      return true;
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
      // Rollback (hoặc lý tưởng nhất là fetch lại)
      await fetchCart(); // Fetch lại để đồng bộ nếu có lỗi
      return false;
    }
  };

  // Xóa một sản phẩm (API MỚI - Dùng PUT quantity: 0)
  // **LƯU Ý:** Component gọi hàm này (vd: Cart.jsx) phải truyền `sku` (chính là `p.variant_id`)
  const removeFromCart = async (sku) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng!");
      return;
    }

    setIsLoadingCart(true);
    try {
      // 6.3 Cập nhật item (xóa bằng cách set quantity = 0)
      await axios.put(
        `${API_URL}/api/cart/items`,
        {
          sku: sku,
          quantity: 0,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchCart(); // Tải lại giỏ hàng sau khi xóa
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng!");
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Cập nhật số lượng sản phẩm (API MỚI)
  // **LƯU Ý:** Component gọi hàm này (vd: Cart.jsx) phải truyền `sku` (chính là `p.variant_id`)
  const updateCartQuantity = async (sku, quantity) => {
    if (!user?.user_id || !token) {
      toast.error("Vui lòng đăng nhập để cập nhật giỏ hàng!");
      return false;
    }

    if (quantity <= 0) {
      // Nếu số lượng <= 0, gọi hàm xóa
      await removeFromCart(sku);
      return;
    }

    setIsLoadingCart(true);
    try {
      // 6.3 Cập nhật item trong giỏ hàng (PUT /cart/items)
      await axios.put(
        `${API_URL}/api/cart/items`,
        {
          sku: sku,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchCart(); // Tải lại giỏ hàng sau khi cập nhật
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

  // Xóa toàn bộ giỏ hàng (API MỚI)
  const clearCart = async () => {
    if (!user?.user_id || !token) {
      setCart([]);
      localStorage.setItem("cart", JSON.stringify([]));
      return;
    }

    setIsLoadingCart(true);
    try {
      // 6.4 Xóa toàn bộ giỏ hàng (DELETE /cart)
      await axios.delete(`${API_URL}/api/cart`, {
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
