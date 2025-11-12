import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const PLACEHOLDER_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="%23e0e0e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

// Hàm lấy token từ cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Hàm đọc user từ localStorage
const getStoredUser = () => {
  const storedUserString = localStorage.getItem("user");
  if (!storedUserString || storedUserString === "undefined") {
    return null;
  }
  try {
    return JSON.parse(storedUserString);
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
};

// Hàm che email
const maskEmail = (email) => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  if (localPart.length <= 4) {
    return `${localPart.charAt(0)}...${localPart.charAt(
      localPart.length - 1
    )}@${domain}`;
  }
  const firstTwo = localPart.substring(0, 2);
  const lastTwo = localPart.substring(localPart.length - 2);
  return `${firstTwo}...${lastTwo}@${domain}`;
};

// Component InputRow
const InputRow = ({ label, ...props }) => (
  <div className="grid grid-cols-3 items-center py-1">
    <label className="text-sm text-gray-600">{label}</label>
    <input
      {...props}
      className={`col-span-2 p-2 text-sm bg-gray-50 rounded border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black ${
        props.readOnly
          ? "cursor-not-allowed text-gray-500 bg-gray-200"
          : "text-black"
      }`}
    />
  </div>
);

// --- COMPONENT CHÍNH ---
export default function AccountInfo() {
  // --- STATE ---
  const [originalUser, setOriginalUser] = useState(getStoredUser());
  const token = getCookie("token");
  const fileInputRef = useRef(null);

  // State Form 1
  const [fullName, setFullName] = useState(
    originalUser?.full_name || "Immanuel"
  );
  const [phone, setPhone] = useState(originalUser?.phone || "0782446689");
  const [avatarPreview, setAvatarPreview] = useState(
    originalUser?.avatarUrl || PLACEHOLDER_AVATAR
  );
  const [avatarFile, setAvatarFile] = useState(null);

  // State Form 2
  const [email, setEmail] = useState(originalUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State ẩn/hiện mật khẩu
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Biến đã che email
  const maskedEmail = maskEmail(email);

  if (!originalUser) {
    // Trạng thái chờ nếu user chưa load
    return <p>Đang tải thông tin...</p>;
  }

  // Xử lý chọn tệp ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý upload ảnh (Placeholder)
  const handleImageUpload = async (file) => {
    toast.info("Đang xử lý tải ảnh lên...");
    console.log("Bắt đầu upload file:", file.name);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const fakeUrl = `https://example.com/new-avatar-${Date.now()}.jpg`;
    console.log("Upload giả lập thành công:", fakeUrl);

    return fakeUrl;
  };

  // Form 1: Cập nhật thông tin
  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Phiên đăng nhập hết hạn.");
      return;
    }

    let finalAvatarUrl = originalUser.avatarUrl;
    let didUploadNewImage = false;

    // 1. Upload ảnh nếu có
    if (avatarFile) {
      try {
        finalAvatarUrl = await handleImageUpload(avatarFile);
        setAvatarFile(null);
        didUploadNewImage = true;
      } catch (err) {
        toast.error("Upload ảnh thất bại.");
        return;
      }
    }

    // 2. Xây dựng payload
    const updatedFields = {};
    if (fullName !== originalUser.full_name) {
      updatedFields.fullName = fullName;
    }
    if (phone !== originalUser.phone) {
      updatedFields.phone = phone;
    }
    if (didUploadNewImage && finalAvatarUrl !== originalUser.avatarUrl) {
      updatedFields.avatarUrl = finalAvatarUrl;
    }

    // 3. Kiểm tra nếu không có gì thay đổi
    if (Object.keys(updatedFields).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào.");
      return;
    }

    // 4. Gọi API
    try {
      const response = await axios.put(
        `${API_URL}/api/users/profile/me`,
        updatedFields,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 5. Xử lý thành công
      if (response.data.status === true) {
        toast.success(
          response.data.data.message || "Cập nhật thông tin thành công!"
        );

        // Tự xây dựng object user mới vì API không trả về
        const newUserForStorage = { ...originalUser };
        if (updatedFields.fullName) {
          newUserForStorage.full_name = updatedFields.fullName;
        }
        if (updatedFields.phone) {
          newUserForStorage.phone = updatedFields.phone;
        }
        if (updatedFields.avatarUrl) {
          newUserForStorage.avatarUrl = updatedFields.avatarUrl;
        }

        // Cập nhật localStorage và state gốc
        localStorage.setItem("user", JSON.stringify(newUserForStorage));
        setOriginalUser(newUserForStorage);

        // Đồng bộ lại form
        setFullName(newUserForStorage.full_name);
        setPhone(newUserForStorage.phone);
        setAvatarPreview(newUserForStorage.avatarUrl || PLACEHOLDER_AVATAR);
      } else {
        toast.error(response.data.data.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  // Form 2: Đổi mật khẩu
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Phiên đăng nhập hết hạn.");
      return;
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ các trường mật khẩu.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    // Gọi API
    const body = { currentPassword, newPassword };
    try {
      const response = await axios.put(
        `${API_URL}/api/users/password/change`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === true) {
        toast.success(response.data.data.message || "Đổi mật khẩu thành công!");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.data.message || "Đổi mật khẩu thất bại.");
      }
    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra.");
    }
  };

  return (
    <>
      {/* Form 1: Thông tin tài khoản */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold mb-6">Thông tin tài khoản</h2>
        <form onSubmit={handleAccountUpdate} className="space-y-3">
          <InputRow
            label="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <InputRow
            label="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="grid grid-cols-3 items-center py-1">
            <label className="text-sm text-gray-600">Ảnh đại diện</label>
            <div className="col-span-2 flex items-center gap-4">
              <img
                src={avatarPreview || PLACEHOLDER_AVATAR}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
                onError={(e) => (e.target.src = PLACEHOLDER_AVATAR)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-5 py-2 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Thay đổi
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                hidden
                accept="image/png, image/jpeg, image/gif"
              />
            </div>
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="px-8 py-2.5 border border-black rounded-full font-semibold text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>

      {/* Form 2: Thay đổi mật khẩu */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 mt-8">
        <h2 className="text-2xl font-semibold mb-6">Thay đổi mật khẩu</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <InputRow label="Email" value={maskedEmail} readOnly={true} />

          <div className="grid grid-cols-3 items-center py-1">
            <label className="text-sm text-gray-600">Mật khẩu cũ</label>
            <div className="col-span-2 relative">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type={showCurrentPass ? "text" : "password"}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full p-2 text-sm bg-gray-50 rounded border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-black"
              >
                {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center py-1">
            <label className="text-sm text-gray-600">Mật khẩu mới</label>
            <div className="col-span-2 relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type={showNewPass ? "text" : "password"}
                placeholder="Nhập mậtK khẩu mới (ít nhất 6 ký tự)"
                className="w-full p-2 text-sm bg-gray-50 rounded border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-black"
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center py-1">
            <label className="text-sm text-gray-600">Xác nhận MK mới</label>
            <div className="col-span-2 relative">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.g.value)}
                type={showConfirmPass ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full p-2 text-sm bg-gray-50 rounded border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-gray-500 hover:text-black"
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="px-8 py-2.5 border border-black rounded-full font-semibold text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
            >
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
