import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCategoryBySlug,
  getProductsByCategoryId,
  getTotalProductsByCategoryId,
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

  const limit = 20;

  const fetchData = async (pageToFetch = page) => {
    try {
      setLoading(true);

      // Lấy category theo slug nếu chưa có
      let cat = category;
      if (!cat) {
        const catRes = await getCategoryBySlug(slug);
        cat = catRes.data;
        setCategory(cat);
      }

      // Lấy tổng số sản phẩm để tính totalPages
      const totalProducts = await getTotalProductsByCategoryId(
        cat.category_id,
        filters
      );
      console.log("total:", totalProducts);
      const calculatedTotalPages = Math.ceil(totalProducts / limit) || 1;
      setTotalPages(calculatedTotalPages);

      // Lấy sản phẩm theo trang
      const prodRes = await getProductsByCategoryId(
        cat.category_id,
        pageToFetch,
        limit,
        filters,
        sort
      );

      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      console.error("Lỗi load category:", err);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Khi slug, filter hoặc sort đổi => reset về trang 1 và load lại
  useEffect(() => {
    setPage(1);
    setCategory(null); // reset để refetch category đúng
    fetchData(1);
  }, [slug, filters, sort]);

  // Khi page đổi => load lại đúng trang
  useEffect(() => {
    if (category) {
      fetchData(page);
    }
  }, [page]);

  if (loading) return <p className="text-center py-10">Đang tải sản phẩm...</p>;
  if (!category)
    return <p className="text-center py-10">Không tìm thấy danh mục</p>;

  return (
    <div className="container mx-auto px-4 py-8 pt-24 mt-[100px]">
      <Breadcrumb
        items={[
          { label: "Danh mục", href: "/categories" },
          { label: category.name },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="bg-white rounded-xl shadow p-4 sticky top-28">
            <h3 className="font-semibold mb-4 text-lg">Bộ lọc</h3>
            <FilterSidebar onFilterChange={setFilters} />
          </div>
        </aside>
        <main className="md:col-span-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <SortMenu onSortChange={setSort} />
          </div>

          <ProductGrid products={products} />

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
