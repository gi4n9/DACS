import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import CategoryPage from "./components/CategoryPage";
import Layout from "./components/Layout";
import Chat from "./components/ChatBox";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/:slug" element={<CategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Chat />
    </BrowserRouter>
  );
}

export default App;
