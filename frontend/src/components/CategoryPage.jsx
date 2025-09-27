import { useParams } from "react-router-dom";

const CategoryPage = () => {
  const { slug } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Category: {slug}</h1>
      {/* TODO: gọi API để lấy sản phẩm theo slug */}
    </div>
  );
};

export default CategoryPage;
