import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 1. Import tất cả API cần thiết cho CRUD
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from "@/lib/api";
import addressData from "@/data/address.json";

// 2. Helper lấy token
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// 3. State ban đầu cho form
const initialFormState = {
  fullName: "",
  phone: "",
  street: "",
  province: "",
  district: "",
  ward: "",
  isDefault: false,
};

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State để quản lý việc Thêm (null) hay Sửa (object)
  const [currentAddress, setCurrentAddress] = useState(null);

  // State cho form thêm/sửa
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);

  // State cho dropdown địa chỉ
  const [provinces, setProvinces] = useState(addressData || []);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Hàm tải danh sách địa chỉ
  const fetchAddresses = async () => {
    const token = getCookie("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getUserAddresses(token);
      if (res.status === true) {
        setAddresses(res.data.addresses || []);
      } else {
        toast.error(res.message || "Không thể tải sổ địa chỉ.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải địa chỉ.");
    } finally {
      setLoading(false);
    }
  };

  // Tải địa chỉ khi component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  // useEffect để điền dropdown Huyện/Xã khi Sửa
  useEffect(() => {
    if (formData.province) {
      const selectedProv = provinces.find((p) => p.Name === formData.province);
      if (selectedProv) {
        setDistricts(selectedProv.Districts || []);
        if (formData.district) {
          const selectedDist = selectedProv.Districts.find(
            (d) => d.Name === formData.district
          );
          if (selectedDist) {
            setWards(selectedDist.Wards || []);
          }
        }
      }
    }
  }, [formData.province, formData.district, provinces]);

  // --- Logic Mở/Đóng Modal ---

  const openAddModal = () => {
    setCurrentAddress(null); // Đặt chế độ "Thêm mới"
    setFormData(initialFormState); // Reset form
    setDistricts([]); // Xóa dropdown
    setWards([]); // Xóa dropdown
    setIsModalOpen(true);
  };

  const openEditModal = (address) => {
    setCurrentAddress(address); // Đặt chế độ "Sửa"
    setFormData(address); // Điền form với dữ liệu cũ
    setIsModalOpen(true);
  };

  // --- Logic Form (Dropdown và Input) ---
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Logic Gọi API ---

  // Hàm Submit Form (Xử lý cả Thêm và Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    if (!token) return;

    setFormLoading(true);
    try {
      let res;
      if (currentAddress) {
        // Chế độ SỬA (PUT)
        res = await updateUserAddress(currentAddress._id, formData, token);
      } else {
        // Chế độ THÊM (POST)
        res = await addUserAddress(formData, token);
      }

      // Xử lý kết quả
      if (res.status === true) {
        toast.success(
          res.data.message ||
            (currentAddress ? "Cập nhật thành công!" : "Thêm thành công!")
        );
        setIsModalOpen(false); // Đóng modal
        fetchAddresses(); // Tải lại danh sách
      } else {
        toast.error(res.message || "Thao tác thất bại.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi.");
    } finally {
      setFormLoading(false);
    }
  };

  // Hàm XÓA
  const handleDelete = async (addressId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }
    const token = getCookie("token");
    if (!token) return;

    try {
      const res = await deleteUserAddress(addressId, token);
      if (res.status === true) {
        toast.success(res.message || "Xóa địa chỉ thành công!");
        fetchAddresses(); // Tải lại danh sách
      } else {
        toast.error(res.message || "Xóa thất bại.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa.");
    }
  };

  // Hàm ĐẶT MẶC ĐỊNH
  const handleSetDefault = async (addressId) => {
    const token = getCookie("token");
    if (!token) return;

    try {
      const res = await setDefaultUserAddress(addressId, token);
      if (res.status === true) {
        toast.success("Đặt làm địa chỉ mặc định thành công!");
        fetchAddresses(); // Tải lại danh sách
      } else {
        toast.error(res.message || "Đặt mặc định thất bại.");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi đặt mặc định.");
    }
  };

  // --- RENDER ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Sổ địa chỉ</h2>

        {/* Nút Thêm Mới - Mở Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>Thêm địa chỉ mới</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {/* Tiêu đề động: Thêm hoặc Sửa */}
                {currentAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </DialogTitle>
            </DialogHeader>

            {/* Form Thêm Mới / Sửa */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="fullName"
                  placeholder="Họ tên *"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="phone"
                  placeholder="Số điện thoại *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Dropdown Địa chỉ */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  onValueChange={handleProvinceChange}
                  value={
                    provinces.find((p) => p.Name === formData.province)?.Id ||
                    ""
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Tỉnh/Thành phố *" />
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
                  value={
                    districts.find((d) => d.Name === formData.district)?.Id ||
                    ""
                  }
                  disabled={!districts.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn Quận/Huyện *" />
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
                    <SelectValue placeholder="Chọn Phường/Xã *" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((w) => (
                      <SelectItem key={w.Id} value={String(w.Id)}>
                        {w.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  name="street"
                  placeholder="Số nhà, tên đường *"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isDefault: checked }))
                  }
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <Button type="submit" disabled={formLoading} className="w-full">
                {formLoading
                  ? "Đang lưu..."
                  : currentAddress
                  ? "Lưu thay đổi"
                  : "Lưu địa chỉ"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hiển thị danh sách địa chỉ */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-gray-500">Bạn chưa có địa chỉ nào được lưu.</p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr._id}
                className="border p-4 rounded-lg flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold">
                    {addr.fullName}{" "}
                    {addr.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.phone}</p>
                  <p className="text-sm text-gray-600 mt-2">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-end">
                  {/* Nút Đặt mặc định */}
                  {!addr.isDefault && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => handleSetDefault(addr._id)}
                    >
                      Đặt mặc định
                    </Button>
                  )}
                  {/* Nút Sửa */}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => openEditModal(addr)}
                  >
                    Sửa
                  </Button>
                  {/* Nút Xóa */}
                  <Button
                    variant="link"
                    size="sm"
                    className="text-red-500 p-0 h-auto"
                    onClick={() => handleDelete(addr._id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
