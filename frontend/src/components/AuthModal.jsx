import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthModal({
  open,
  onClose,
  anchorRef,
  onLoginSuccess,
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setStartPos({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    }
  }, [open, anchorRef]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/api/users/login" : "/api/users/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : {
            full_name: form.full_name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            address: form.address,
          };

      const res = await axios.post(`${API_URL}${endpoint}`, body, {
        withCredentials: true,
      });

      if (isLogin) {
        const { token, user } = res.data; // Giả sử API trả về token và user
        if (!token) {
          throw new Error("Không nhận được token từ server");
        }

        // Lưu token vào localStorage
        localStorage.setItem("token", token);

        // Gọi API /api/users/me để lấy thông tin cá nhân
        const profile = await axios.get(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = profile.data.data;
        if (!userData?.user_id) {
          throw new Error("Không nhận được user_id từ server");
        }

        localStorage.setItem("user", JSON.stringify(userData));
        onLoginSuccess(userData, token); // Truyền cả userData và token
        toast.success("Đăng nhập thành công");
        onClose();
      } else {
        toast.success(res.data.message || "Đăng ký thành công");
        setIsLogin(true); // Chuyển sang chế độ đăng nhập sau khi đăng ký
      }
    } catch (err) {
      console.error("Lỗi đăng nhập/đăng ký:", err);
      toast.error(
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center"
            initial={{ scale: 0.2, opacity: 0, x: startPos.x, y: startPos.y }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0.2, opacity: 0, x: startPos.x, y: startPos.y }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="bg-white p-6 rounded-xl shadow-xl w-[400px] relative">
              <h2 className="text-xl font-bold mb-4 text-center">
                {isLogin ? "Đăng nhập" : "Đăng ký"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLogin && (
                  <>
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      className="w-full border px-3 py-2 rounded"
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      className="w-full border px-3 py-2 rounded"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ"
                      className="w-full border px-3 py-2 rounded"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      required
                    />
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border px-3 py-2 rounded"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />

                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="w-full border px-3 py-2 rounded"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded hover:bg-neutral-800"
                >
                  {isLogin ? "Đăng nhập" : "Đăng ký"}
                </button>
              </form>

              <div className="mt-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full border border-neutral-400 py-2 rounded hover:bg-neutral-100"
                >
                  Đăng nhập với Google
                </button>
              </div>

              <p className="mt-4 text-sm text-center">
                {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 underline"
                >
                  {isLogin ? "Đăng ký" : "Đăng nhập"}
                </button>
              </p>

              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
