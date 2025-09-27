import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AoThunNam from "./pages/Collection/AoThunNam";
import ProductPage from "@/pages/Product/ProductPage";
import CategoryPage from "./components/CategoryPage";
import Layout from "./components/Layout";
import Chat from "./components/ChatBox";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection/ao-thun-nam" element={<AoThunNam />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/:slug" element={<CategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Chat />
    </BrowserRouter>
  );
}

export default App;
