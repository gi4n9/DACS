const express = require("express");
const router = express.Router();

const CategoryService = require("../service/categoryService");
const queryHandler = require("../middlewares/queryHandle");

router.get("/", queryHandler, async (req, res) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.render("homepage", {
      title: "HNG Store - Thời trang nam tối giản",
      categories: Array.isArray(categories) ? categories : [categories],
    });
  } catch (error) {
    res.json({ message: "ERROR", error });
  }
});

module.exports = router;
