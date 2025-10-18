import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Giả sử các hình ảnh carousel đầu tiên
const heroImages = [
  "/C40_HC_Hero_Desktop-1.avif",
  "/OLS_Hero_Banner_-_1920_x_799.avif",
];
const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const navigate = useNavigate();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // --- THAY ĐỔI LOGIC STATE ---
  // Lưu trữ toàn bộ danh sách phẳng
  const [allCategories, setAllCategories] = useState([]);
  // Lưu trữ các danh mục cấp 1 (Genders)
  const [topLevelCategories, setTopLevelCategories] = useState([]);
  // Lưu trữ các danh mục cấp 2 (để hiển thị)
  const [subCategories, setSubCategories] = useState([]);
  // Sử dụng ID để theo dõi gender đang hoạt động
  const [activeGenderId, setActiveGenderId] = useState(null);

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // --- THAY ĐỔI LOGIC FETCH CATEGORIES ---
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
  }, []); // Chỉ chạy 1 lần khi mount

  // --- THAY ĐỔI LOGIC XỬ LÝ CLICK ---
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

      {/* --- THAY ĐỔI GENDER BUTTONS --- */}
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

      {/* --- THAY ĐỔI CATEGORY CAROUSEL --- */}
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
                // THAY ĐỔI: Dùng cat._id (từ API) thay vì cat.category_id
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

      {/* Banner */}
      <section className="relative w-full h-full">
        <img
          src="/Master_Banner_-_Desktop(1)11.webp"
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Product Carousel (Đã bị comment out) */}
    </main>
  );
};

export default Home;
