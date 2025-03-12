const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const session = require("express-session");
const homePageRouter = require("./routers/homepage.routes");
const productRouter = require("./routers/product.routes");
const collectionRouter = require("./routers/collection.routes");
const cartRouter = require("./routers/cart.routes");
const authRouter = require("./routers/auth");
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

// Parse incoming requests with JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình Handlebars làm view engine
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
      formatCurrency: function (amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
      },
      multiply: function (a, b) {
        return a * b;
      },
      lookup: function (obj, key) {
        return obj[key] || key; // Use the key as fallback if not found in map
      }
    }
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "resources", "view"));

app.use(morgan("dev"));

app.use("/", homePageRouter);
app.use("/", authRouter);
app.use("/product", productRouter);
app.use("/collection", collectionRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);

app.use((req, res, next) => {
  res.status(404).render("errorpage");
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}/`);
});
