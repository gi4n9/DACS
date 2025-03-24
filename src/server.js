const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const session = require("express-session");
const homePageRouter = require("./routers/homepage.routes");
const productRouter = require("./routers/product.routes");
const collectionRouter = require("./routers/collection.routes");
const meRouter = require("./routers/me.routes");
const cartRouter = require("./routers/cart.routes");
const authRouter = require("./routers/auth.routes");
const adminRouter = require("./routers/admin.routes");
const cookieParser = require("cookie-parser");
const userFromToken = require("./middlewares/userFromToken.middleware");
const {
  authMiddleware,
  adminMiddleware,
} = require("./middlewares/authMiddlewares");
const cors = require("cors");

const app = express();
const port = 3000;

const allowedOrigins = ["http://localhost:3000", "https://fshop.nghienshopping.online"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Cho phép gửi cookie/credentials
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
app.use(userFromToken);

// Middleware kiểm tra quyền truy cập
app.use(authMiddleware);

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
        // Thêm helper neq
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

// Routes
app.use("/", authRouter);
app.use("/homepage", homePageRouter);
app.use("/admin", adminMiddleware, adminRouter);
app.use("/product", productRouter);
app.use("/collection", collectionRouter);
app.use("/cart", cartRouter);
app.use("/me", meRouter);

// Xử lý 404
app.use((req, res, next) => {
  res.status(404).render("errorpage");
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}/homepage`);
});
