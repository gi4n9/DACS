document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const userDropdown = document.getElementById("userDropdown");
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  try {
    // Gọi API để lấy thông tin người dùng nếu đã đăng nhập
    const response = await fetch("/me", { credentials: "include" });
    if (!response.ok) throw new Error("Chưa đăng nhập");

    const user = await response.json();

    // Ẩn nút Đăng nhập & Đăng ký, hiển thị dropdown user
    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (userDropdown) userDropdown.classList.remove("hidden");

    // Cập nhật thông tin người dùng
    if (userAvatar && user.avatar) {
      userAvatar.src = user.avatar;
    } else {
      userAvatar.src = "/default-avatar.png"; // Ảnh mặc định nếu không có avatar
    }
    if (userName) userName.textContent = user.email; // Hoặc user.name nếu có

    // Xử lý đăng xuất
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await fetch("/logout", { credentials: "include" });
        window.location.href = "/"; // Chuyển hướng về trang chủ
      });
    }
  } catch (error) {
    console.log("Người dùng chưa đăng nhập:", error);
  }
});
