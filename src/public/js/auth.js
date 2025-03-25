const API_URL = "https://fshop.nghienshopping.online";

document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const userDropdown = document.getElementById("userDropdown");
  const userAvatar = document.getElementById("userAvatar");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  const { token, payload } = getCookie("token") || { token: null, payload: null };
  console.log("auth.js: Token từ cookie:", token);
  console.log("auth.js: Payload từ token:", payload);

  try {
    if (!token) {
      console.log("auth.js: Không tìm thấy token trong cookie");
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Chưa đăng nhập");
    }

    const user = await response.json();
    console.log("auth.js: Dữ liệu người dùng từ API:", user);

    if (loginBtn) loginBtn.style.display = "none";
    if (signupBtn) signupBtn.style.display = "none";
    if (userDropdown) userDropdown.classList.remove("hidden");

    if (userAvatar && user.data.avatar) {
      userAvatar.src = user.data.avatar;
    } else {
      userAvatar.src = "/default-avatar.png";
    }
    if (userName) userName.textContent = user.data.full_name || user.data.email;

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include",
          });
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/";
        } catch (err) {
          console.error("Lỗi khi đăng xuất:", err);
        }
      });
    }
  } catch (error) {
    console.log("Người dùng chưa đăng nhập:", error.message);
    if (loginBtn) loginBtn.style.display = "block";
    if (signupBtn) signupBtn.style.display = "block";
    if (userDropdown) userDropdown.classList.add("hidden");
  }
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  console.log("auth.js: Toàn bộ cookie:", document.cookie);
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const token = parts.pop().split(";").shift();
    if (token) {
      try {
        const payload = decodeJWT(token);
        console.log("auth.js: Payload decode từ token:", payload);
        return { token, payload };
      } catch (error) {
        console.error("Lỗi khi decode token:", error);
        return { token, payload: null };
      }
    }
  }
  console.log(`auth.js: Không tìm thấy cookie với tên ${name}`);
  return { token: null, payload: null };
}

function decodeJWT(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}