import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationMenu from "@/components/NavigationMenu";
import Carousel from "@/components/Carousel";
import React from "react";
import Home from "@/components/Home";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-[#fefcff] relative">
      {/* Dreamy Sky Pink Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
        radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
        }}
      />
      {/* Your Content/Components */}
      <div className="mx-auto relative z-10">
        <div className="w-full mx-auto space-y-6">
          {/* Header */}
          <Header />

          {/* HOMEPAGE */}
          <Home />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
