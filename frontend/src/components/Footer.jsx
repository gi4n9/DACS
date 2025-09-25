import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-sm">
          © {new Date().getFullYear()} MyShop. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
