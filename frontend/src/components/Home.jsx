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
  const [name, setName] = useState("Thời trang nam");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  // const [products, setProducts] = useState([]);
  // const [exampleCategory] = useState("Sản phẩm chạy bộ");

  // Fetch categories based on gender
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cat`);
        const allCategories = response.data.data || [];
        setCategories(allCategories);

        // --- chọn mặc định NAM ---
        const parent = allCategories.find((cat) =>
          cat.name.toLowerCase().includes("nam")
        );
        if (parent && parent.children) {
          setSubCategories(parent.children);
          setName("NAM");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Xử lý khi chọn gender
  const handleGenderClick = (genderLabel) => {
    setName(genderLabel);

    const parent = categories.find((cat) => {
      if (genderLabel === "NAM") return cat.name.toLowerCase().includes("nam");
      if (genderLabel === "NỮ") return cat.name.toLowerCase().includes("nữ");
      if (genderLabel === "UNISEX")
        return cat.name.toLowerCase().includes("unisex");
      return false;
    });

    if (parent && parent.children) {
      setSubCategories(parent.children);
    } else {
      setSubCategories([]);
    }
  };

  // Fetch products for example category (adjust as needed)
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const response = await axios.get(
  //         `/api/products/category/${exampleCategory}`
  //       );
  //       setProducts(response.data);
  //     } catch (error) {
  //       console.error("Error fetching products:", error);
  //     }
  //   };
  //   fetchProducts();
  // }, [exampleCategory]);

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

  // Product Carousel navigation (similar, assume 4 per view for products)
  // const productPerView = 4;
  // const [currentProductIndex, setCurrentProductIndex] = useState(0);
  // const prevProduct = () =>
  //   setCurrentProductIndex((prev) => Math.max(prev - productPerView, 0));
  // const nextProduct = () =>
  //   setCurrentProductIndex((prev) =>
  //     Math.min(prev + productPerView, products.length - productPerView)
  //   );

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

      {/* Gender Buttons */}
      <section className="flex justify-start space-x-4 mt-8 ml-8 ">
        <Button
          onClick={() => handleGenderClick("NAM")}
          variant={name === "NAM" ? "default" : "outline"}
          className="rounded-full"
        >
          NAM
        </Button>
        <Button
          onClick={() => handleGenderClick("NỮ")}
          variant={name === "NỮ" ? "default" : "outline"}
          className="rounded-full"
        >
          NỮ
        </Button>
        <Button
          onClick={() => handleGenderClick("UNISEX")}
          variant={name === "UNISEX" ? "default" : "outline"}
          className="rounded-full"
        >
          UNISEX
        </Button>
      </section>

      {/* Category Carousel */}
      {/* Category Carousel */}
      <section className="relative w-full px-4">
        <div className="overflow-hidden p-6">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${
                (currentCategoryIndex / categoryPerView) * 100
              }%)`,
            }}
          >
            {subCategories.map((cat) => (
              <div
                key={cat.category_id}
                onClick={() => navigate(`/${cat.slug}`)}
                className="min-w-[16.66%] cursor-pointer"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-[340px] hover:scale-105 transition-transform h-[480px] object-cover rounded-2xl"
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
          className="absolute left-0 ml-3 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextCategory}
          className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 bg-white/70 p-2 rounded-full shadow"
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
      <section className="relative w-full h-full my-8">
        <img
          src="/Master_Banner_-_Desktop(1)11.webp"
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </section>

      {/* Category Name */}
      {/* <section className="text-center my-4">
        <h2 className="text-2xl font-bold">{exampleCategory}</h2>
      </section> */}

      {/* Product Carousel */}
      {/* <section className="relative w-full px-4">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${
                (currentProductIndex / productPerView) * 100
              }%)`,
            }}
          >
            {products.map((prod, index) => (
              <Card key={index} className="min-w-[25%] mx-2">
                {" "} */}
      {/* 100%/4 = 25% */}
      {/* <CardContent className="p-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-48 object-cover mb-2"
                  />
                  <p className="text-center">{prod.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <button
          onClick={prevProduct}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/50 p-2"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextProduct}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/50 p-2"
        >
          <ChevronRight />
        </button>
      </section> */}
    </main>
  );
};

export default Home;
