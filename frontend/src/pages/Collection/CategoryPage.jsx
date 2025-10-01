import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCategoryBySlug, getProductsByCategoryId } from "@/lib/api";
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

  const limit = 12;

  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ lấy category theo slug
      const catRes = await getCategoryBySlug(slug);
      const cat = catRes.data;
      setCategory(cat);

      // ✅ dùng category_id để fetch product
      const prodRes = await getProductsByCategoryId(
        cat.category_id,
        page,
        limit,
        filters,
        sort
      );

      const data = prodRes.data;
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Lỗi load category:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, page, filters, sort]); // ✅ dependencies dùng slug

  if (loading) return <p className="text-center py-10">Đang tải sản phẩm...</p>;
  if (!category)
    return <p className="text-center py-10">Không tìm thấy danh mục</p>;

  return (
    <div className="container mx-auto px-4 py-8 pt-24 mt-[100px]">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: "Nam", href: "/men" }, { label: category.name }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-4 sticky top-28">
            <h3 className="font-semibold mb-4 text-lg">Bộ lọc</h3>
            <FilterSidebar onFilterChange={setFilters} />
          </div>
        </aside>

        {/* Main */}
        <main className="md:col-span-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <SortMenu onSortChange={setSort} />
          </div>

          <ProductGrid products={products} />

          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default CategoryPage;
