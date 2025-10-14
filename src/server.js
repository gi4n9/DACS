require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const session = require("express-session");
const homePageRouter = require("./routers/homepage.routes");
const productRouter = require("./routers/product.routes");
const collectionRouter = require("./routers/collection.routes");
const searchRouter = require("./routers/search.routes");
const meRouter = require("./routers/me.routes");
const cartRouter = require("./routers/cart.routes");
const authRouter = require("./routers/auth.routes");
const adminRouter = require("./routers/admin.routes");
const chatRouter = require("./routers/chat.routes");
const paymentRouter = require("./routers/payment.routes");
const cookieParser = require("cookie-parser");
const userFromToken = require("./middlewares/userFromToken.middleware");
const {
  authMiddleware,
  adminMiddleware,
} = require("./middlewares/authMiddlewares");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const fetch = require("node-fetch"); // để gọi API sản phẩm

const app = express();
const port = 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://fshop.nghienshopping.online",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Configure session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Middleware cơ bản
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware để decode token
// app.use(userFromToken);

// // Middleware kiểm tra quyền truy cập
// app.use(authMiddleware);

// Cấu hình Handlebars
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "resources", "view", "layouts"),
    partialsDir: path.join(__dirname, "resources", "view", "partials"),
    helpers: {
      eq: function (a, b) {
        return a === b;
      },
      neq: function (a, b) {
        return a !== b;
      },
      json: function (context) {
        return JSON.stringify(context);
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "resources", "view"));

app.use(morgan("dev"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Routes
app.use("/", authRouter);
app.use("/admin", adminMiddleware, adminRouter);
app.use("/homepage", homePageRouter);
app.use("/product", productRouter);
app.use("/search", searchRouter);
app.use("/collection", collectionRouter);
app.use("/payment", paymentRouter);
app.use("/cart", cartRouter);
app.use("/chat", chatRouter);
app.use("/me", meRouter);
app.use((req, res, next) => {
  res.status(404).render("errorpage");
});
console.log("MOMO_PARTNER_CODE:", process.env.MOMO_PARTNER_CODE);
console.log("MOMO_ACCESS_KEY:", process.env.MOMO_ACCESS_KEY);
console.log("MOMO_SECRET_KEY:", process.env.MOMO_SECRET_KEY);
console.log("MOMO_IPN_URL:", process.env.MOMO_IPN_URL);
// Khởi động server
app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}/homepage`);
});
