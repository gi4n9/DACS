import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCarousel from "./ProductCarousel";
import { getProductsByCategorySlug, getRecommendedProducts } from "@/lib/api";

// Giả sử các hình ảnh carousel đầu tiên
const heroImages = [
  "/C40_HC_Hero_Desktop-1.avif",
  "/OLS_Hero_Banner_-_1920_x_799.avif",
];
const API_URL = import.meta.env.VITE_API_URL;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const Home = () => {
  const navigate = useNavigate();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // State cho Categories
  const [allCategories, setAllCategories] = useState([]);
  const [topLevelCategories, setTopLevelCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [activeGenderId, setActiveGenderId] = useState(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // State cho carousel sản phẩm
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [menTShirts, setMenTShirts] = useState([]);
  const [womenJackets, setWomenJackets] = useState([]);
  const [recommended, setRecommended] = useState([]);

  // useEffect tải Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories`);
        const flatList = response.data.data || [];
        setAllCategories(flatList); // Lưu trữ toàn bộ

        // 1. Lấy danh mục cấp 1 (Giống Header.jsx: !cat.parentId)
        const genders = flatList.filter((cat) => !cat.parentId);
        setTopLevelCategories(genders);

        // 2. Set default (Ưu tiên "NAM", nếu không có thì lấy cái đầu tiên)
        if (genders.length > 0) {
          const defaultGender =
            genders.find((g) => g.name.toUpperCase() === "NAM") || genders[0];
          setActiveGenderId(defaultGender._id);

          // 3. Lọc danh mục con cho default gender
          const defaultSubCats = flatList.filter(
            (cat) => cat.parentId === defaultGender._id
          );
          setSubCategories(defaultSubCats);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // useEffect tải các carousel sản phẩm
  useEffect(() => {
    const fetchProductCarousels = async () => {
      setLoadingProducts(true);
      const token = getCookie("token");

      // Lấy 12 sản phẩm cho mỗi carousel để có 3 trang (12/4=3)
      const menTShirtPromise = getProductsByCategorySlug("ao-thun-nam", 1, 12);
      const womenJacketPromise = getProductsByCategorySlug(
        "ao-khoac-nu",
        1,
        12
      );

      // Chỉ gọi API gợi ý nếu có token
      const recPromise = token
        ? getRecommendedProducts(token, 12)
        : Promise.resolve({ status: false, data: [] });

      // Chạy song song
      const [menRes, womenRes, recRes] = await Promise.all([
        menTShirtPromise,
        womenJacketPromise,
        recPromise,
      ]);

      // Xử lý "Áo thun nam" (từ api.js, res.data.data.products)
      if (menRes.status && menRes.data.products) {
        setMenTShirts(menRes.data.products);
      }

      // Xử lý "Áo khoác nữ" (từ api.js, res.data.data.products)
      if (womenRes.status && womenRes.data.products) {
        setWomenJackets(womenRes.data.products);
      }

      // Xử lý "Gợi ý" (từ api.js, res.data.data là mảng)
      if (recRes.status && Array.isArray(recRes.data)) {
        setRecommended(recRes.data);
      }

      setLoadingProducts(false);
    };

    fetchProductCarousels();
  }, []); // Chỉ chạy 1 lần khi mount

  const handleGenderClick = (genderId) => {
    setActiveGenderId(genderId);
    // Lọc danh mục con từ danh sách đầy đủ
    const newSubCats = allCategories.filter((cat) => cat.parentId === genderId);
    setSubCategories(newSubCats);
    setCurrentCategoryIndex(0); // Reset vị trí carousel khi đổi gender
  };

  // Hero Carousel navigation
  const prevHero = () =>
    setCurrentHeroIndex((prev) =>
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  const nextHero = () =>
    setCurrentHeroIndex((prev) =>
      prev === heroImages.length - 1 ? 0 : prev + 1
    );

  // Category Carousel navigation (6 per view)
  const categoryPerView = 6;
  const prevCategory = () =>
    setCurrentCategoryIndex((prev) => Math.max(prev - categoryPerView, 0));
  const nextCategory = () =>
    setCurrentCategoryIndex((prev) =>
      Math.min(prev + categoryPerView, subCategories.length - categoryPerView)
    );

  return (
    <main className="flex flex-col">
      {/* Hero Carousel */}
      <section className="relative w-full">
        <img
          src={heroImages[currentHeroIndex]}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <button
          onClick={prevHero}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextHero}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 p-2 rounded-full"
        >
          <ChevronRight />
        </button>
      </section>

      {/* --- GENDER BUTTONS --- */}
      <section className="container flex justify-start space-x-4 mt-8">
        {topLevelCategories.map((gender) => (
          <Button
            key={gender._id}
            onClick={() => handleGenderClick(gender._id)}
            variant={activeGenderId === gender._id ? "default" : "outline"}
            className="rounded-full px-8 py-5"
          >
            {gender.name.toUpperCase()}
          </Button>
        ))}
      </section>

      {/* --- CATEGORY CAROUSEL --- */}
      <section className="container relative w-full px-4">
        <div className="overflow-hidden p-6">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${
                (currentCategoryIndex / categoryPerView) * 100
              }%)`,
            }}
          >
            {/* Vẫn lặp qua subCategories (đã được lọc ở handleGenderClick) */}
            {subCategories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/${cat.slug}`)}
                className="min-w-[16.66%] cursor-pointer"
              >
                <div className="flex flex-col items-center px-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-[340px] hover:scale-105 transition-transform h-[400px] object-cover rounded-2xl"
                  />
                  <p className="mt-8 text-center text-sm font-semibold uppercase">
                    {cat.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nút điều hướng */}
        <button
          onClick={prevCategory}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextCategory}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
        >
          <ChevronRight />
        </button>
      </section>

      {/* Ad Cards */}
      <section className="grid grid-cols-2 gap-4 my-8 px-4">
        <div className="relative h-full rounded-2xl overflow-hidden cursor-pointer">
          <img
            src="/pro_nam_Frame_88042_(2)-min.avif"
            alt="Collection 1"
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <h1 className="absolute text-white  text-6xl bottom-30 left-4 z-1">
            MEN WEAR
          </h1>
          <p className="absolute text-white  text-2xl bottom-20 left-4 z-1">
            Giảm ngay 40% cho sản phẩm thứ 2
          </p>
          <Button className="absolute bottom-4 left-4 rounded-full px-6 py-5">
            Khám phá
          </Button>
        </div>

        <div className="relative h-full rounded-2xl overflow-hidden cursor-pointer">
          <img
            src="/pro_nu_Frame_88041_(2)-min.avif"
            alt="Collection 2"
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <h1 className="absolute text-white  text-6xl bottom-30 left-4 z-1">
            WOMEN ACTIVE
          </h1>
          <p className="absolute text-white  text-2xl bottom-20 left-4 z-1">
            Giảm ngay 40% cho sản phẩm thứ 2
          </p>
          <Button className="absolute bottom-4 left-4 rounded-full px-6 py-5">
            Khám phá
          </Button>
        </div>
      </section>

      {/* --- CAROUSEL SẢN PHẨM --- */}
      <div className="container mx-auto space-y-16 my-16 px-4">
        {!loadingProducts && recommended.length > 0 && (
          <ProductCarousel title="Gợi ý cho bạn" products={recommended} />
        )}
        {!loadingProducts && menTShirts.length > 0 && (
          <ProductCarousel
            title="Áo Thun Nam"
            products={menTShirts}
            viewMoreLink="/ao-thun-nam"
          />
        )}
      </div>

      {/* Banner  */}
      <section className="relative w-full h-full my-16">
        <img
          src="/Master_Banner_-_Desktop(1)11.webp"
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Container 2: Áo khoác nữ + Loading */}
      <div className="container mx-auto space-y-16 my-16 px-4">
        {!loadingProducts && womenJackets.length > 0 && (
          <ProductCarousel
            title="Áo Khoác Nữ"
            products={womenJackets}
            viewMoreLink="/ao-khoac-nu"
          />
        )}
        {loadingProducts && (
          <p className="text-center text-gray-500">Đang tải sản phẩm...</p>
        )}
      </div>
    </main>
  );
};

export default Home;
