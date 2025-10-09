import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "./ui/navigation-menu";
import { Input } from "./ui/input";
import { Search, User, ShoppingCart, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import debounce from "lodash/debounce";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function Header({ openAuth, userBtnRef, user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef(null);
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useCart();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cat`);
        setCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Scroll listener
  useEffect(() => {
    const RANGE = 140;
    let ticking = false;

    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      const p = Math.min(Math.max(y / RANGE, 0), 1);
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search API
  const fetchSearchResults = debounce(async (term) => {
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/products/search/name?name=${encodeURIComponent(term)}`
      );
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    fetchSearchResults(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (isInputFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputFocused, searchResults]);

  const handleSearchSelect = () => {
    setSearchTerm("");
  };

  // Animation styles
  const topStyle = {
    transform: `translateY(${scrollProgress * 22}px) scaleY(${
      1 - scrollProgress * 0.6
    })`,
    opacity: 1 - scrollProgress,
    transformOrigin: "top center",
    transition: "transform 150ms linear, opacity 150ms linear",
  };

  const bottomStyle = {
    transform: `translateY(-${scrollProgress * 80}px)`,
    opacity: 1 - scrollProgress,
    transformOrigin: "bottom center",
    transition: "transform 150ms linear, opacity 150ms linear",
  };

  const midStyle = {
    transform: `translateY(-${scrollProgress * 32}px)`,
    transition: "transform 150ms linear",
  };

  return (
    <header className="fixed top-0 z-50 w-full flex flex-col">
      {/* DIV 1 */}
      <div
        className="h-8 bg-neutral-500 overflow-hidden"
        style={topStyle}
        aria-hidden={scrollProgress >= 0.99}
      >
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 w-full flex h-8 items-center justify-center lg:justify-between text-xs text-neutral-200">
          <ul className="flex space-x-4">
            <li>
              <a href="/about">VỀ HNG</a>
            </li>
            <li>
              <a href="/cxp">CXP</a>
            </li>
          </ul>
          <ul className="hidden lg:flex space-x-4">
            <li>
              <a href="/coolclub">Coolclub</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
            <li>
              <a href="/support">CSKH</a>
            </li>
            <li>
              {!user && (
                <button
                  onClick={openAuth}
                  ref={userBtnRef}
                  className="hover:underline"
                >
                  Đăng nhập
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>

      {/* DIV 2 */}
      <div
        className="z-50 h-13 border-b border-b-neutral-300 bg-background shadow-sm lg:h-17"
        style={midStyle}
      >
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 w-full h-full">
          <div className="flex h-full items-center justify-between">
            {/* Logo */}
            <figure>
              <a
                href="/"
                className="flex h-20 w-20 items-center justify-center"
              >
                <img src="/logoHNGstore.png" alt="logo_store" />
              </a>
            </figure>

            {/* Navigation menu */}
            <div className="flex flex-1 justify-center">
              <NavigationMenu>
                <NavigationMenuList className="flex space-x-4">
                  {categories.map((parent) => (
                    <NavigationMenuItem key={parent.category_id}>
                      <NavigationMenuTrigger>
                        {parent.name.toUpperCase()}
                      </NavigationMenuTrigger>
                      {parent.children?.length > 0 && (
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {parent.children.map((child) => (
                              <ListItem
                                key={child.category_id}
                                title={child.name}
                                href={`/${child.slug}`}
                              >
                                {child.description || ""}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Search + User + Cart */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex items-center">
                <Popover
                  open={
                    searchTerm.length > 0 &&
                    (searchResults.length > 0 || isLoading)
                  }
                >
                  <PopoverTrigger asChild>
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Tìm kiếm..."
                      className="w-48 pr-10 rounded-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-80 p-4"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    {isLoading ? (
                      <p className="text-center text-sm text-muted-foreground">
                        Đang tải...
                      </p>
                    ) : searchResults.length > 0 ? (
                      <ul className="space-y-2 max-h-[600px] overflow-y-auto">
                        {searchResults.map((product) => (
                          <li key={product.product_id}>
                            <a
                              href={`/product/${product.product_id}`}
                              className="flex items-center space-x-4 hover:bg-neutral-100 p-2 rounded"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={handleSearchSelect}
                            >
                              <img
                                src={product.image || "/fallback-image.png"}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {product.price.toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  })}
                                </p>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        Không có kết quả
                      </p>
                    )}
                  </PopoverContent>
                </Popover>
                <Search className="absolute right-2 h-5 w-5 text-neutral-500" />
              </div>

              {/* User / Avatar */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <img
                      src={user.avatar || "/avatardefault.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
                      <a
                        href="/cart"
                        className="block px-4 py-2 hover:bg-neutral-100"
                      >
                        Giỏ hàng
                      </a>
                      <a
                        href="/profile"
                        className="block px-4 py-2 hover:bg-neutral-100"
                      >
                        Thông tin cá nhân
                      </a>
                      <button
                        onClick={() => {
                          onLogout(clearCart);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  ref={userBtnRef}
                  onClick={openAuth}
                  className="text-neutral-700 hover:text-neutral-900"
                >
                  <User className="h-6 w-6" />
                </button>
              )}

              {/* Cart */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative text-neutral-700 hover:text-neutral-900">
                    <ShoppingCart className="h-6 w-6" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {cart.reduce((sum, p) => sum + p.qty, 0)}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-80 p-4" align="end">
                  <h3 className="font-bold mb-2">Giỏ hàng</h3>

                  {cart.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có sản phẩm</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {cart.map((p) => (
                        <div
                          key={p.cart_id}
                          className="flex items-center space-x-3 border-b pb-2 mb-2"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              {p.color} / {p.size}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1"
                                value={p.qty}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1;
                                  updateCartQuantity(p.cart_id, newQty);
                                }}
                                className="w-16"
                              />
                              <p className="text-sm">
                                × {p.price.toLocaleString()}đ
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(p.cart_id)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="mt-4">
                      <a
                        href="/cart"
                        className="block w-full text-center bg-black text-white py-2 rounded-md"
                      >
                        Xem giỏ hàng
                      </a>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* DIV 3 */}
      <div
        className="bg-gray-700 text-white w-full py-2 overflow-hidden"
        style={bottomStyle}
        aria-hidden={scrollProgress >= 0.99}
      >
        <div className="flex items-center justify-center whitespace-nowrap text-xs font-medium uppercase max-lg:animate-marquee2 lg:text-sm">
          Nhập "COOLNEW" giảm 30K cho đơn đầu tiên từ 199K
          <a
            href="/collection/summer"
            className="ml-4 underline underline-offset-1"
          >
            KHÁM PHÁ
          </a>
        </div>
      </div>
    </header>
  );
}

function ListItem({ title, children, href }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a href={href}>
          <div className="text-sm font-medium">{title}</div>
          {children && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
}
