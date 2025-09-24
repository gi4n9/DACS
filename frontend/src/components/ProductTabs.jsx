import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function ProductTabs({ description }) {
  return (
    <div className="mt-12">
      <Tabs defaultValue="desc" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-6">
          <TabsTrigger value="desc">Mô tả</TabsTrigger>
          <TabsTrigger value="info">Thông tin chi tiết</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="desc">
          <p className="text-gray-700">{description}</p>
        </TabsContent>

        <TabsContent value="info">
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Chất liệu: Polyester tái chế</li>
            <li>Form: Regular Fit</li>
            <li>Thích hợp: Tập luyện, hoạt động thường ngày</li>
          </ul>
        </TabsContent>

        <TabsContent value="reviews">
          <p className="text-gray-700">Hiện chưa có đánh giá nào.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProductTabs;
