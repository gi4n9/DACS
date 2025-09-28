"use client";

import React, { useState, useEffect } from "react";
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

// Sample data for dropdown menus
const newItems = [
  {
    title: "New Arrivals",
    href: "/new/arrivals",
    description: "Explore the latest collections and trends.",
  },
  {
    title: "Limited Editions",
    href: "/new/limited",
    description: "Exclusive items available for a limited time.",
  },
];

const menItems = [
  {
    title: "Shirts",
    href: "/men/4",
    description: "Casual and formal shirts for men.",
  },
  {
    title: "Trousers",
    href: "/men/trousers",
    description: "Comfortable and stylish trousers.",
  },
  {
    title: "Jackets",
    href: "/men/jackets",
    description: "Outerwear for all seasons.",
  },
];

const womenItems = [
  {
    title: "Dresses",
    href: "/women/dresses",
    description: "Elegant dresses for every occasion.",
  },
  {
    title: "Tops",
    href: "/women/tops",
    description: "Trendy tops and blouses.",
  },
  {
    title: "Skirts",
    href: "/women/skirts",
    description: "Versatile skirts for any style.",
  },
];

const accessoriesItems = [
  {
    title: "Bags",
    href: "/accessories/bags",
    description: "Stylish handbags and backpacks.",
  },
  {
    title: "Jewelry",
    href: "/accessories/jewelry",
    description: "Elegant accessories to complete your look.",
  },
  {
    title: "Hats",
    href: "/accessories/hats",
    description: "Fashionable hats for all seasons.",
  },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header className="fixed top-[-1] z-50 w-full lg:top-0">
      <div
        className="h-8 transition-all duration-200"
        variant={`${isScrolled ? "hidden" : "block"}`}
      >
        <div className="mx-auto max-w-full md:px-4 xl:px-12 2xl:px-16 px-4 sm:px-6 lg:px-8 w-full flex h-8 items-center justify-center bg-neutral-500 lg:justify-between">
          <ul className="flex h-full items-center justify-evenly max-lg:flex-1 md:justify-between">
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href="/about"
                className="block h-full flex-1 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                VỀ HNG
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="block h-full flex-1 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600">
              <a href="/cxp">CXP</a>
              <span className="absolute right-0 z-10 my-2 h-4.5 w-[1px] bg-neutral-300/20 hidden"></span>
            </li>
          </ul>
          <ul className="hidden h-full items-center justify-evenly max-lg:flex-1 md:justify-between lg:flex">
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href="/coolclub"
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                Coolclub
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href="/blog"
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                Blog
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href="/support"
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                CSKH
              </a>
              <span className="absolute right-0 z-10 my-2 block h-4.5 w-[1px] bg-neutral-300/20"></span>
            </li>
            <li className="relative flex h-full flex-1 items-center lg:flex-none">
              <a
                href="/login"
                className="flex h-full flex-1 items-center gap-0.5 whitespace-nowrap px-2 py-2 pt-2.5 text-center font-criteria text-xs font-medium leading-3.5 text-neutral-200 transition-colors hover:bg-neutral-600"
              >
                Đăng nhập
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="h-13 border-b border-b-neutral-300 bg-background shadow-sm lg:h-17">
        <div className="mx-auto max-w-full md:px-4 xl:px-12 2xl:px-16 px-4 sm:px-6 lg:px-8 w-full h-full">
          <div className="relative flex h-full items-center justify-between">
            <figure className="flex justify-start">
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
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>NEW</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {newItems.map((item) => (
                          <ListItem
                            key={item.title}
                            title={item.title}
                            href={item.href}
                          >
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>NAM</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {menItems.map((item) => (
                          <ListItem
                            key={item.title}
                            title={item.title}
                            href={item.href}
                          >
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>NỮ</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {womenItems.map((item) => (
                          <ListItem
                            key={item.title}
                            title={item.title}
                            href={item.href}
                          >
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>PHỤ KIỆN</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {accessoriesItems.map((item) => (
                          <ListItem
                            key={item.title}
                            title={item.title}
                            href={item.href}
                          >
                            {item.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
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
      <div
        className="mx-auto bg-gray-700 text-white max-w-full md:px-4 xl:px-12 2xl:px-16 px-4 sm:px-6 lg:px-8 w-full py-2"
        variant={`${isScrolled ? "hidden" : "block"} bg-gray-100 h-8`}
      >
        <div className="flex items-center justify-center whitespace-nowrap text-xs font-medium uppercase text-inherit max-lg:animate-marquee2 lg:text-sm lg:leading-4.5">
          Nhập "COOLNEW" giảm 30K cho đơn đầu tiên từ 199K
          <a
            href="/collection/summer"
            className="ml-4 leading-4.5 text-inherit underline underline-offset-1"
          >
            KHÁM PHÁ
          </a>
        </div>
      </div>
    </header>
  );
};

// Reusable ListItem component for dropdown items
function ListItem({ title, children, href, ...props }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

export default Header;
