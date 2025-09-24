import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function SizeGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Hướng dẫn chọn size
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bảng size tham khảo</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-center border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Size</th>
                <th className="p-2 border">Chiều cao (cm)</th>
                <th className="p-2 border">Cân nặng (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">S</td>
                <td className="border">160-168</td>
                <td className="border">50-58</td>
              </tr>
              <tr>
                <td className="border p-2">M</td>
                <td className="border">168-174</td>
                <td className="border">58-66</td>
              </tr>
              <tr>
                <td className="border p-2">L</td>
                <td className="border">174-180</td>
                <td className="border">66-75</td>
              </tr>
              <tr>
                <td className="border p-2">XL</td>
                <td className="border">180-186</td>
                <td className="border">75-85</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SizeGuideDialog;
