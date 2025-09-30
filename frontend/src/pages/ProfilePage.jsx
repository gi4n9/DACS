export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <p className="p-6">Bạn chưa đăng nhập.</p>;
  }

  return (
    <div className="p-6 mt-[150px]">
      <h1 className="text-2xl font-bold mb-4">Thông tin cá nhân</h1>
      <p>
        <strong>Họ tên:</strong> {user.full_name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Số điện thoại:</strong> {user.phone}
      </p>
      <p>
        <strong>Địa chỉ:</strong> {user.address}
      </p>
    </div>
  );
}
