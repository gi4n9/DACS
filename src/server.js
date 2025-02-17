const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = 3000;

app.use(morgan("dev"));

app.get("/homepage", (req, res) => {
  res.sendFile("/view/homepage.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(
    `Example app listening on port http://localhost:${port}/homepage`
  );
});
