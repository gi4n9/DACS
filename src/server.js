const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const session = require("express-session");
const homePageRouter = require("./routers/homepage.routes");
const productRouter = require("./routers/product.routes");
const collectionRouter = require("./routers/collection.routes");
const cartRouter = require("./routers/cart.routes");
const authRouter = require("./routers/auth.routes");
const adminRouter = require("./routers/admin.routes");
const cookieParser = require("cookie-parser");
const checkAuth = require("./middlewares/checkAuth");

const {
  authMiddleware,
  adminMiddleware,
} = require("./middlewares/authMiddlewares");

const app = express();
const port = 3000;

// Configure session middleware
app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authMiddleware);
app.use(checkAuth);

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
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "resources", "view"));

app.use(morgan("dev"));

app.use("/", authRouter);
app.use("/homepage", homePageRouter);
app.use("/admin", adminMiddleware, adminRouter);
app.use("/product", productRouter);
app.use("/collection", collectionRouter);
app.use("/cart", cartRouter);

app.use((req, res, next) => {
  res.status(404).render("errorpage");
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}/homepage`);
});
