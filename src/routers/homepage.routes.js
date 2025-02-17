const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("homepage", { title: "Trang Chủ" });
});

module.exports = router;
