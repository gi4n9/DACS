import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getProductsByCategorySlug, // Đã đổi
} from "@/lib/api";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import SortMenu from "@/components/SortMenu";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    size: null,
    color: null,
    minPrice: 0,
    maxPrice: 10000000,
  });
  const [sort, setSort] = useState(null);

  const limit = 20; // API của bạn trả về limit 20

  const fetchData = async (pageToFetch) => {
    if (!slug) return; // Không fetch nếu không có slug

    try {
      setLoading(true);

      // Chỉ cần gọi 1 API
      const res = await getProductsByCategorySlug(
        slug,
        pageToFetch,
        limit,
        filters,
        sort
      );

      // Xử lý response mới
      if (res.status && res.data) {
        // Cập nhật category (lấy phần tử đầu tiên từ mảng category)
        setCategory(res.data.category?.[0] || null);

        // Cập nhật sản phẩm
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);

        // Cập nhật phân trang
        setTotalPages(res.data.pagination?.totalPages || 1);
        setPage(res.data.pagination?.page || 1); // Đồng bộ trang hiện tại
      } else {
        throw new Error("API response không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi load category:", err);
      setProducts([]);
      setTotalPages(1);
      setCategory(null); // Không tìm thấy category
    } finally {
      setLoading(false);
    }
  };

  // 1. Khi filter, sort, hoặc slug thay đổi => reset về trang 1
  useEffect(() => {
    // setCategory(null) để UI reset (ví dụ: breadcrumb) trong khi chờ load
    setCategory(null);
    setPage(1);
  }, [slug, filters, sort]);

  // 2. Khi page hoặc slug thay đổi (hoặc filter/sort đã trigger page=1) => gọi data
  // Logic này đảm bảo khi filter/sort đổi, nó setPage(1) và trigger effect này
  useEffect(() => {
    fetchData(page);
  }, [slug, page, filters, sort]); // Thêm filters, sort để fetch lại khi page đã là 1

  if (loading && !category) {
    // Hiển thị loading chỉ khi chưa có dữ liệu lần đầu
    return <p className="text-center py-10 mt-[100px]">Đang tải sản phẩm...</p>;
  }

  if (!category && !loading) {
    return (
      <p className="text-center py-10 mt-[100px]">Không tìm thấy danh mục</p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 mt-[100px]">
      {category && ( // Chỉ hiển thị khi đã có category
        <Breadcrumb
          items={[
            { label: "Danh mục", href: "/categories" },
            { label: category.name },
          ]}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-4 sticky top-28">
            <h3 className="font-semibold mb-4 text-lg">Bộ lọc</h3>
            <FilterSidebar onFilterChange={setFilters} />
          </div>
        </aside>
        <main className="md:col-span-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">
              {category ? category.name : "..."}
            </h1>
            <SortMenu onSortChange={setSort} />
          </div>

          {loading ? (
            <p className="text-center py-10">Đang cập nhật...</p>
          ) : (
            <ProductGrid products={products} />
          )}

          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => {
                if (newPage !== page) setPage(newPage);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default CategoryPage;
