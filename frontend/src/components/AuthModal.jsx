import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AuthModal({
  open,
  onClose,
  anchorRef,
  onLoginSuccess,
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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

  const validateForm = () => {
    const newErrors = {};
    console.log("Dữ liệu form:", form);

    if (!isLogin) {
      if (
        !form.fullName ||
        form.fullName.length < 2 ||
        form.fullName.length > 50
      ) {
        newErrors.fullName = "Họ và tên phải từ 2 đến 50 ký tự";
      }
      if (form.phone && !/^0\d{9}$/.test(form.phone)) {
        newErrors.phone = "Số điện thoại phải gồm 10 số và bắt đầu bằng 0";
      }
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (
      !form.password ||
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/\d/.test(form.password)
    ) {
      newErrors.password =
        "Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số";
    }

    console.log("Lỗi validate:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
      return;
    }

    try {
      console.log("API_URL:", API_URL);
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: form.email.trim(), password: form.password.trim() }
        : {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            phone: form.phone.trim() || "",
          };
      console.log("Dữ liệu gửi đi:", body);

      const res = await axios.post(`${API_URL}${endpoint}`, body, {
        withCredentials: true,
      });
      console.log("Phản hồi từ server:", res.data);

      if (isLogin) {
        const { accessToken, user } = res.data.data || {};
        if (!accessToken || !user) {
          throw new Error(
            "Không nhận được token hoặc thông tin user từ server"
          );
        }
        onLoginSuccess(user, accessToken);
        toast.success("Đăng nhập thành công");
        setForm({ fullName: "", email: "", password: "", phone: "" });
        setErrors({});
        setShowPassword(false);
        onClose();
      } else {
        const { id, email } = res.data.data || {};
        if (!id || !email) {
          throw new Error(
            "Đăng ký thất bại: Không nhận được thông tin từ server"
          );
        }
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
        setForm({ fullName: "", email: "", password: "", phone: "" });
        setErrors({});
        setShowPassword(false);
      }
    } catch (err) {
      console.error("Lỗi đăng nhập/đăng ký:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại.";
      if (err.response?.status === 409) {
        errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác.";
      } else if (err.response?.status === 401) {
        errorMessage = "Email hoặc mật khẩu không đúng.";
      } else {
        errorMessage =
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  if (!open) return null;

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
                    <div>
                      <input
                        type="text"
                        placeholder="Họ và tên"
                        className={`w-full border px-3 py-2 rounded ${
                          errors.fullName ? "border-red-500" : ""
                        }`}
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        required
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Số điện thoại (không bắt buộc)"
                        className={`w-full border px-3 py-2 rounded ${
                          errors.phone ? "border-red-500" : ""
                        }`}
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className={`w-full border px-3 py-2 rounded ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    className={`w-full border px-3 py-2 rounded ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

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
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setForm({
                      fullName: "",
                      email: "",
                      password: "",
                      phone: "",
                    });
                    setShowPassword(false);
                  }}
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
