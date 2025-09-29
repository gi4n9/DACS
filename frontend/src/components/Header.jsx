"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "./ui/navigation-menu";
import { Input } from "./ui/input";
import { Search, User, ShoppingCart } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0); // 0..1

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
    const RANGE = 140; // px scroll distance for full animation
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
    transform: `translateY(${-scrollProgress * 22}px) scaleY(${
      1 - scrollProgress * 0.6
    })`,
    opacity: 1 - scrollProgress,
    transformOrigin: "bottom center",
    transition: "transform 150ms linear, opacity 150ms linear",
  };

  const midStyle = {
    transform: `translateY(-${scrollProgress * 32}px)`, // dịch nav lên trên
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
              <a href="/login">Đăng nhập</a>
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
            <figure>
              <a
                href="/"
                className="flex h-20 w-20 items-center justify-center"
              >
                <img src="/logoHNGstore.png" alt="logo_store" />
              </a>
            </figure>

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

            <div className="flex items-center space-x-4">
              <div className="relative flex items-center">
                <Input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-48 pr-10"
                />
                <Search className="absolute right-2 h-5 w-5 text-neutral-500" />
              </div>
              <a
                href="/login"
                className="text-neutral-700 hover:text-neutral-900"
              >
                <User className="h-6 w-6" />
              </a>
              <a
                href="/cart"
                className="text-neutral-700 hover:text-neutral-900"
              >
                <ShoppingCart className="h-6 w-6" />
              </a>
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
};

// ListItem cho dropdown
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

export default Header;
