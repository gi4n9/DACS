import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Import Button

const API_URL = import.meta.env.VITE_API_URL;

// Hàm lấy token
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 'pending', 'success', 'failed'
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Đang xác thực thanh toán...");

  useEffect(() => {
    const verifyPayment = async () => {
      const token = getCookie("token");

      // Lấy tham số từ URL
      const orderCode = searchParams.get("orderId");
      const resultCode = searchParams.get("resultCode");

      if (!token) {
        setStatus("failed");
        setMessage("Phiên đăng nhập hết hạn. Không thể xác thực.");
        toast.error("Lỗi xác thực: Không tìm thấy token.");
        return;
      }

      if (!orderCode) {
        setStatus("failed");
        setMessage("Không tìm thấy mã đơn hàng. Giao dịch có thể đã thất bại.");
        toast.error("Lỗi xác thực: URL không chứa mã đơn hàng.");
        return;
      }

      // 1. Kiểm tra sơ bộ resultCode từ Momo
      // (Nếu khác 0 nghĩa là người dùng bấm hủy hoặc có lỗi)
      if (resultCode !== "0") {
        setStatus("failed");
        const momoMessage = searchParams.get("message") || "Giao dịch bị hủy";
        setMessage(`Giao dịch không thành công: ${momoMessage}`);
        toast.error(`Giao dịch thất bại: ${momoMessage}`);
        return;
      }

      // 2. (Quan trọng) Gọi backend để xác thực
      // Backend sẽ kiểm tra xem nó đã nhận được webhook hợp lệ chưa
      try {
        console.log(`Đang gọi GET /api/payments/momo/status/${orderCode}`);

        const response = await axios.get(
          `${API_URL}/api/payments/momo/status/${orderCode}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Giả sử backend trả về { status: true, data: { status: 'success' } }
        // khi đã nhận webhook và xác thực thành công
        if (
          response.data.status === true &&
          response.data.data?.status === "success"
        ) {
          setStatus("success");
          setMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");
          toast.success("Thanh toán thành công!");

          // Tự động chuyển về trang cá nhân sau 3 giây
          setTimeout(() => {
            navigate("/profile"); // Hoặc trang "Đơn hàng của tôi"
          }, 3000);
        } else {
          // Trường hợp backend báo thất bại (vd: chưa nhận được webhook, chữ ký không khớp)
          throw new Error(
            response.data.message ||
              "Xác thực server thất bại. Đơn hàng đang chờ xử lý."
          );
        }
      } catch (err) {
        console.error("Lỗi khi xác thực thanh toán:", err);
        const errorMsg =
          err.response?.data?.message || err.message || "Lỗi kết nối server.";
        setStatus("failed");
        setMessage(`Xác thực thanh toán thất bại: ${errorMsg}`);
        toast.error(`Xác thực thất bại: ${errorMsg}`);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="w-full flex justify-center items-center mt-[150px] py-20">
      <div className="text-center space-y-4">
        {status === "pending" && (
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
        )}
        {status === "success" && (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        )}
        {status === "failed" && (
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        )}
        <h1 className="text-2xl font-bold">{message}</h1>
        {status === "success" && (
          <p>Bạn sẽ được chuyển hướng sau giây lát...</p>
        )}
        {status === "failed" && (
          <Button onClick={() => navigate("/")}>Quay về trang chủ</Button>
        )}
      </div>
    </div>
  );
}
