import React, { useState, useEffect } from "react";
import addressData from "@/data/address.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

// --- CÀI ĐẶT API ---
const API_URL = import.meta.env.VITE_API_URL;

// --- HÀM HELPER (Copy từ các file khác) ---
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

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

// --- COMPONENT FORM ĐỊA CHỈ (Dùng cho Modal) ---
// (Component này chứa logic form giống hệt Cart.jsx)
const AddressForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    street: initialData?.street || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    ward: initialData?.ward || "",
    isDefault: initialData?.isDefault || false,
  });

  const [provinces, setProvinces] = useState(addressData || []);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Hàm điền dữ liệu Huyện/Xã khi edit
  useEffect(() => {
    if (initialData?.province) {
      const selectedProv = provinces.find(
        (p) => p.Name === initialData.province
      );
      if (selectedProv) {
        setDistricts(selectedProv.Districts || []);
        if (initialData.district) {
          const selectedDist = selectedProv.Districts.find(
            (d) => d.Name === initialData.district
          );
          if (selectedDist) {
            setWards(selectedDist.Wards || []);
          }
        }
      }
    }
  }, [initialData, provinces]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (value) => {
    const selected = provinces.find((p) => String(p.Id) === value);
    setFormData((prev) => ({
      ...prev,
      province: selected ? selected.Name : "",
      district: "",
      ward: "",
    }));
    setDistricts(selected ? selected.Districts : []);
    setWards([]);
  };

  const handleDistrictChange = (value) => {
    const selected = districts.find((d) => String(d.Id) === value);
    setFormData((prev) => ({
      ...prev,
      district: selected ? selected.Name : "",
      ward: "",
    }));
    setWards(selected ? selected.Wards : []);
  };

  const handleWardChange = (value) => {
    const selected = wards.find((w) => String(w.Id) === value);
    setFormData((prev) => ({
      ...prev,
      ward: selected ? selected.Name : "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Họ tên"
        />
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Số điện thoại"
        />
      </div>
      <Input
        name="street"
        value={formData.street}
        onChange={handleInputChange}
        placeholder="Số nhà, tên đường"
      />
      <div className="grid grid-cols-3 gap-4">
        <Select
          onValueChange={handleProvinceChange}
          value={provinces.find((p) => p.Name === formData.province)?.Id || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tỉnh/Thành phố" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.Id} value={String(p.Id)}>
                {p.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={handleDistrictChange}
          value={districts.find((d) => d.Name === formData.district)?.Id || ""}
          disabled={!districts.length}
        >
          <SelectTrigger>
            <SelectValue placeholder="Quận/Huyện" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.Id} value={String(d.Id)}>
                {d.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={handleWardChange}
          value={wards.find((w) => w.Name === formData.ward)?.Id || ""}
          disabled={!wards.length}
        >
          <SelectTrigger>
            <SelectValue placeholder="Phường/Xã" />
          </SelectTrigger>
          <SelectContent>
            {wards.map((w) => (
              <SelectItem key={w.Id} value={String(w.Id)}>
                {w.Name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isDefault: checked }))
          }
        />
        <label htmlFor="isDefault" className="text-sm">
          Đặt làm địa chỉ mặc định
        </label>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        </DialogClose>
        <Button type="submit">Lưu địa chỉ</Button>
      </DialogFooter>
    </form>
  );
};

// --- COMPONENT TRANG SỔ ĐỊA CHỈ ---
export default function AddressBook() {
  const [user, setUser] = useState(getStoredUser());
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null); // null = 'add', object = 'edit'
  const token = getCookie("token");

  // Hàm gọi API /profile/me để refresh dữ liệu
  const refetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data.data;
      if (userData?.user_id) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setAddresses(userData.addresses || []);
      }
    } catch (err) {
      toast.error("Lỗi khi tải lại dữ liệu người dùng.");
    }
  };

  // Hàm gọi API /manage (chung cho Add, Update, Delete, SetDefault)
  const callManageApi = async (body, successMessage) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/addresses/manage`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === true) {
        toast.success(successMessage);
        await refetchUser(); // Tải lại dữ liệu
        return true;
      } else {
        throw new Error(response.data.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Address manage error:", err);
      toast.error(err.response?.data?.message || err.message);
      return false;
    }
  };

  // Xử lý Mở/Đóng Modal
  const openAddModal = () => {
    setCurrentAddress(null);
    setIsModalOpen(true);
  };
  const openEditModal = (address) => {
    setCurrentAddress(address);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAddress(null);
  };

  // Xử lý Submit Form (Add & Edit)
  const handleSaveAddress = async (formData) => {
    const body = {
      action: currentAddress ? "update" : "add",
      address: formData,
    };

    if (currentAddress) {
      body.addressId = currentAddress._id;
    }

    const success = await callManageApi(
      body,
      currentAddress
        ? "Cập nhật địa chỉ thành công!"
        : "Thêm địa chỉ thành công!"
    );

    if (success) {
      closeModal();
    }
  };

  // Xử lý Xóa
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    const body = { action: "delete", addressId };
    await callManageApi(body, "Xóa địa chỉ thành công!");
  };

  // Xử lý Đặt mặc định
  const handleSetDefault = async (addressId) => {
    const body = { action: "set_default", addressId };
    await callManageApi(body, "Đặt làm địa chỉ mặc định thành công!");
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Sổ địa chỉ</h2>
        <Button onClick={openAddModal}>Thêm địa chỉ mới</Button>
      </div>

      {/* Danh sách địa chỉ */}
      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className="border p-4 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">
                  {addr.fullName}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Mặc định
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">{addr.phone}</p>
                <p className="text-sm text-gray-600">
                  {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => openEditModal(addr)}
                >
                  Sửa
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeleteAddress(addr._id)}
                >
                  Xóa
                </Button>
                {!addr.isDefault && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleSetDefault(addr._id)}
                  >
                    Đặt mặc định
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Bạn chưa có địa chỉ nào được lưu.</p>
        )}
      </div>

      {/* Modal Thêm/Sửa Địa chỉ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {currentAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            initialData={currentAddress}
            onSave={handleSaveAddress}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
