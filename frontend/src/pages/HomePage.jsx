import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationMenu from "@/components/NavigationMenu";
import Carousel from "@/components/Carousel";
import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen w-full bg-[#fff9f5] relative">
      {/* Warm Light Apricot & Coral */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(255, 220, 190, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 245, 238, 0.35) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 210, 180, 0.15) 0%, transparent 50%)`,
        }}
      />
      {/* Your Content/Components */}
      <div className="container pt-8 mx-auto relative z-10">
        <div className="w-full max-w-2xl -6 mx-auto space-y-6">
          {/* Header */}
          <Header />

          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Navigation Menu */}
            <NavigationMenu />

            {/* Carousel */}
            <Carousel />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
