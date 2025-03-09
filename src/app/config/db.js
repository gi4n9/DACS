const mysql = require("mysql2/promise");

// Tạo kết nối MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root", // Thay bằng username MySQL của bạn
  password: "Giang@1234", // Thay bằng password MySQL của bạn
  database: "usercoolmate", // Thay bằng tên database của bạn
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối
db.getConnection()
  .then(() => console.log("MySQL connected"))
  .catch((err) => console.error("MySQL connection error:", err));

module.exports = db;
