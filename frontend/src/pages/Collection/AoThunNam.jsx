import { useState, useEffect } from "react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import SortMenu from "@/components/SortMenu";
import CustomPagination from "@/components/Pagination";
import {
  getProductsByCategory,
  getProductsBySize,
  getProductsByColor,
  getProductsByPrice,
} from "@/lib/api";

function AoThunNam() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 8; // số sản phẩm mỗi trang

  // Load khi mount hoặc khi đổi filter/page
  useEffect(() => {
    const fetchData = async () => {
      try {
        let data;

        if (filters.size) {
          data = await getProductsBySize(filters.size, page, limit);
        } else if (filters.color) {
          data = await getProductsByColor(filters.color, page, limit);
        } else if (filters.priceRange) {
          data = await getProductsByPrice(
            filters.priceRange[0],
            filters.priceRange[1],
            page,
            limit
          );
        } else {
          // categoryId = 2 => áo thun nam
          data = await getProductsByCategory(2, page, limit);
        }

        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
      }
    };

    fetchData();
  }, [filters, page]);

  const handleFilter = (f) => {
    setFilters(f);
    setPage(1); // reset về trang 1 khi đổi filter
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <FilterSidebar onFilterChange={handleFilter} />
        </aside>

        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Áo thun nam</h2>
            <SortMenu onSortChange={() => {}} />
          </div>

          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <CustomPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  if (p >= 1 && p <= totalPages) setPage(p);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AoThunNam;
