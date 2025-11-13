import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AuthCallbackPage({ onLoginSuccess }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken"); // <-- LẤY REFRESH TOKEN
    const error = searchParams.get("error");

    if (error) {
      let errorMessage = "Đăng nhập Google thất bại.";
      if (error === "authentication_failed") {
        errorMessage = "Xác thực Google thất bại.";
      } else if (error === "account_not_active") {
        errorMessage = "Tài khoản của bạn chưa được kích hoạt.";
      }
      toast.error(errorMessage);
      navigate("/");
      return;
    }

    // Đảm bảo phải có accessToken VÀ hàm onLoginSuccess
    if (accessToken && onLoginSuccess) {
      const user = {
        user_id: searchParams.get("userId"),
        email: searchParams.get("email"),
        full_name: searchParams.get("fullName"),
        role: searchParams.get("role"),
      };

      // --- GỌI HÀM LOGIN VỚI CẢ 2 TOKEN ---
      onLoginSuccess(user, accessToken, refreshToken);

      toast.success("Đăng nhập Google thành công!");
      navigate("/");
    } else {
      toast.error("Đường dẫn callback không hợp lệ.");
      navigate("/");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <h2 className="text-xl font-semibold mt-6">Đang xử lý đăng nhập...</h2>
      <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát.</p>
    </div>
  );
}
