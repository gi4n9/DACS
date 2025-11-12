import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductsByCategorySlug } from "@/lib/api";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import SortMenu from "@/components/SortMenu";
import Pagination from "@/components/Pagination";
import Breadcrumb from "@/components/Breadcrumb";
import NotFound from "@/pages/NotFound";

const initialFilters = {
  size: null,
  color: null,
  minPrice: 100000,
  maxPrice: 2000000,
  minRating: null,
};

function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho bộ lọc
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [sort, setSort] = useState(null);

  const limit = 20;

  // Hàm fetchData
  const fetchData = async (pageToFetch) => {
    if (!slug) return;

    try {
      setLoading(true);

      // LUÔN LUÔN gọi cùng 1 API
      const res = await getProductsByCategorySlug(
        slug,
        pageToFetch,
        limit,
        appliedFilters,
        sort
      );

      // Xử lý response
      if (res.status && res.data && res.pagination) {
        const data = res.data;
        const pagination = res.pagination;

        setCategory(data.category?.[0] || null);
        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotalPages(pagination?.totalPages || 1);
        setPage(pagination?.page || 1);
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

  // 1. Khi slug thay đổi
  useEffect(() => {
    setCategory(null);
    setPage(1);
    setAppliedFilters(initialFilters);
    setDraftFilters(initialFilters);
    setSort(null);
  }, [slug]);

  // 2. Khi *bộ lọc* hoặc sort thay đổi
  useEffect(() => {
    setPage(1);
  }, [appliedFilters, sort]);

  // 3. Khi các state chính thay đổi
  useEffect(() => {
    if (slug) {
      fetchData(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, appliedFilters, sort]);

  // Hàm Áp dụng
  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
  };

  if (loading) {
    return <p className="text-center py-10 mt-[100px]">Đang tải sản phẩm...</p>;
  }

  if (!category) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 mt-[70px]">
      {category && (
        <Breadcrumb
          items={[
            { label: "Danh mục", href: "/categories" },
            { label: category.name },
          ]}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 ">
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-4 sticky top-28">
            <h3 className="font-semibold mb-4 text-lg">Bộ lọc</h3>
            <FilterSidebar
              filters={draftFilters}
              onFilterChange={setDraftFilters}
              onApply={handleApplyFilters}
            />
          </div>
        </aside>
        <main className="md:col-span-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">
              {category ? category.name : "..."}
            </h1>
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
