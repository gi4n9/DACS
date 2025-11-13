import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

// Lấy API_URL từ .env (giống như trong AuthModal.jsx)
const API_URL = import.meta.env.VITE_API_URL;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current === true) {
      return;
    }
    // 1. Lấy token từ query parameter '?token=...'
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Không tìm thấy token xác thực trong URL.");
      setIsError(true);
      setLoading(false);
      return;
    }

    // 2. Định nghĩa hàm gọi API
    const verifyToken = async () => {
      setLoading(true);
      try {
        hasFetched.current = true;
        // 3. Gọi API backend với token là path parameter
        // (Giả sử API của anh có tiền tố /api giống như AuthModal)
        const response = await fetch(
          `${API_URL}/api/auth/verify-email/${token}`
        );

        const data = await response.json();

        if (response.ok && data.status === true) {
          // Thành công (200 OK và status: true)
          setMessage(data.data.message || "Xác thực email thành công!");
          setIsError(false);
        } else {
          // Lỗi từ server (400 Bad Request hoặc status: false)
          throw new Error(
            data.message || "Token không hợp lệ hoặc đã hết hạn."
          );
        }
      } catch (err) {
        console.error("Lỗi xác thực:", err);
        setMessage(err.message);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]); // Chạy lại nếu searchParams thay đổi

  // Giao diện hiển thị kết quả
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg max-w-md w-full">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <h2 className="text-xl font-semibold mt-6">
              Đang xác thực email...
            </h2>
            <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát.</p>
          </>
        ) : isError ? (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold mt-6 text-red-700">
              Xác thực thất bại
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 mt-6 font-medium text-white transition shadow-md bg-black rounded-xl hover:bg-neutral-800"
            >
              Quay về trang chủ
            </Link>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold mt-6 text-green-700">
              Xác thực thành công!
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-gray-500 mt-4 text-sm">
              Giờ bạn có thể đóng tab này.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 mt-6 font-medium text-white transition shadow-md bg-black rounded-xl hover:bg-neutral-800"
            >
              Về trang chủ
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
