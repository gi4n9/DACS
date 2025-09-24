import { useState, useEffect } from "react";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import SortMenu from "@/components/SortMenu";
import CustomPagination from "@/components/Pagination";

// fake data cứng (sau gọi API thay)
const productData = [
  {
    id: 1,
    name: "Áo thun basic đen",
    price: 199000,
    img: "/img/ao1.jpg",
    size: "M",
    color: "Đen",
  },
  {
    id: 2,
    name: "Áo thun basic trắng",
    price: 299000,
    img: "/img/ao2.jpg",
    size: "L",
    color: "Trắng",
  },
  {
    id: 3,
    name: "Áo thun thể thao xanh",
    price: 399000,
    img: "/img/ao3.jpg",
    size: "XL",
    color: "Xanh",
  },
  {
    id: 4,
    name: "Áo thun cotton",
    price: 499000,
    img: "/img/ao4.jpg",
    size: "S",
    color: "Đen",
  },
  {
    id: 5,
    name: "Áo thun oversize",
    price: 599000,
    img: "/img/ao5.jpg",
    size: "M",
    color: "Trắng",
  },
  {
    id: 6,
    name: "Áo thun thể thao coolfit",
    price: 699000,
    img: "/img/ao6.jpg",
    size: "L",
    color: "Xanh",
  },
];

function AoThunNam() {
  const [filtered, setFiltered] = useState(productData);
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  const handleFilter = (filters) => {
    let result = productData;
    if (filters.size) result = result.filter((p) => p.size === filters.size);
    if (filters.color) result = result.filter((p) => p.color === filters.color);
    if (filters.priceRange) {
      result = result.filter(
        (p) =>
          p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }
    setFiltered(result);
    setPage(1); // reset về page 1
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentProducts = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
          <ProductGrid products={currentProducts} />

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
