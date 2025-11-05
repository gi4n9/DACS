import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductsByCategorySlug } from "@/lib/api";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import SortMenu from "@/components/SortMenu";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";

// --- THAY ĐỔI: Định nghĩa bộ lọc mặc định ---
const initialFilters = {
  size: null,
  color: null,
  minPrice: 100000,
  maxPrice: 2000000, // Giá trị max của slider
};

function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- THAY ĐỔI: Thêm 2 state cho filters ---
  const [appliedFilters, setAppliedFilters] = useState(initialFilters); // Dùng cho API
  const [draftFilters, setDraftFilters] = useState(initialFilters); // Dùng cho Sidebar

  const [sort, setSort] = useState(null);

  const limit = 20;

  const fetchData = async (pageToFetch) => {
    if (!slug) return;

    try {
      setLoading(true);

      // --- THAY ĐỔI: Gửi `appliedFilters` đi ---
      const res = await getProductsByCategorySlug(
        slug,
        pageToFetch,
        limit,
        appliedFilters, // Dùng bộ lọc đã áp dụng
        sort
      );

      // Xử lý response (Đã sửa ở lần trước)
      if (res.status && res.data) {
        setCategory(res.data.category?.[0] || null);
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setPage(res.data.pagination?.page || 1);
      } else {
        throw new Error("API response không hợp lệ");
      }
    } catch (err) {
      console.error("Lỗi load category:", err);
      setProducts([]);
      setTotalPages(1);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  // --- THAY ĐỔI: Cập nhật các hook useEffect ---

  // 1. Khi slug thay đổi (đổi danh mục)
  // => Reset mọi thứ về trang 1 và reset bộ lọc
  useEffect(() => {
    setCategory(null);
    setPage(1);
    setAppliedFilters(initialFilters);
    setDraftFilters(initialFilters);
    setSort(null); // (Tùy chọn) Reset cả sắp xếp
  }, [slug]);

  // 2. Khi *bộ lọc đã áp dụng* (appliedFilters) hoặc sort thay đổi
  // => Reset về trang 1 (nhưng giữ nguyên bộ lọc)
  useEffect(() => {
    setPage(1);
  }, [appliedFilters, sort]);

  // 3. Khi trang, slug, bộ lọc, hoặc sort thay đổi
  // => Gọi API để lấy dữ liệu mới
  useEffect(() => {
    fetchData(page);
    // (Tắt cảnh báo ESLint vì fetchData đã được tối ưu)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, appliedFilters, sort]); // Phụ thuộc vào appliedFilters

  // (Phần loading giữ nguyên)
  if (loading && !category) {
    return <p className="text-center py-10 mt-[100px]">Đang tải sản phẩm...</p>;
  }
  if (!category && !loading) {
    return (
      <p className="text-center py-10 mt-[100px]">Không tìm thấy danh mục</p>
    );
  }

  // --- THAY ĐỔI: Truyền props mới cho FilterSidebar ---
  return (
    <div className="container mx-auto px-4 py-8 pt-24 mt-[100px]">
      {category && (
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
            {/* - filters: Gửi `draftFilters` cho Sidebar hiển thị
              - onFilterChange: Gửi `setDraftFilters` để Sidebar cập nhật nháp
              - onApply: Gửi hàm để chép `draftFilters` -> `appliedFilters`
            */}
            <FilterSidebar
              filters={draftFilters}
              onFilterChange={setDraftFilters}
              onApply={() => setAppliedFilters(draftFilters)}
            />
          </div>
        </aside>
        <main className="md:col-span-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">
              {category ? category.name : "..."}
            </h1>
            {/* Đặt giá trị cho SortMenu để nó reset khi `sort` thay đổi */}
            <SortMenu value={sort} onSortChange={setSort} />
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
