import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fefcff] relative">
      {/* Header */}
      <Header />

      {/* Nội dung trang */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
