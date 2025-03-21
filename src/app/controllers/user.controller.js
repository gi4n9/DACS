const axios = require("axios");

module.exports.getUserInfo = async (req, res) => {
  try {
    // Kiểm tra xem req.user có tồn tại không
    if (!req.user || !req.user.user_id) {
      return res.status(401).redirect("/login"); // Redirect về login nếu chưa đăng nhập
    }

    const userId = req.user.user_id; // Lấy user_id từ req.user
    console.log("User ID:", userId);

    // Lấy token từ cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).redirect("/login");
    }

    // Gọi API để lấy thông tin user
    const response = await axios.get(
      `https://fshop.nghienshopping.online/api/users/getid/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header
        },
      }
    );

    // Dữ liệu user từ API
    const userData = response.data;

    // Render trang profile.handlebars và truyền dữ liệu user
    res.render("profile", {
      title: "Hồ sơ cá nhân",
      user: {
        user_id: userData.user_id,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        role: userData.role,
        status: userData.status,
        created_at: userData.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).render("errorpage", {
      message: "Không thể lấy thông tin user",
      error: error.response ? error.response.data : error.message,
    });
  }
};
