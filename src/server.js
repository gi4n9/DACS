const express = require("express");
const path = require("path");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const homePageRouter = require("./routers/homepage.routes");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

// Cấu hình Handlebars làm view engine
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "resources", "view", "layouts"),
    partialsDir: path.join(__dirname, "resources", "view", "partials"),
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "resources", "view"));

app.use(morgan("dev"));
app.use("/", homePageRouter);

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}/`);
});
