import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Thêm vào giỏ
  const addToCart = (product) => {
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
      return [...prev, product];
    });
  };

  // Xóa sản phẩm
  const removeFromCart = (variant_id, size, color) => {
    setCart((prev) =>
      prev.filter(
        (p) =>
          !(p.variant_id === variant_id && p.size === size && p.color === color)
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
