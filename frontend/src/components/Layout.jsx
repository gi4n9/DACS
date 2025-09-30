import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router";

const Layout = ({ openAuth, userBtnRef, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fefcff] relative">
      <Header
        openAuth={openAuth}
        userBtnRef={userBtnRef}
        user={user}
        onLogout={onLogout}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
