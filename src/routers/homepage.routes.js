const express = require("express");
const router = express.Router();
const CategoryService = require("../service/categoryService");
const queryHandler = require("../middlewares/queryHandle");
const { authMiddleware } = require("../middlewares/authMiddlewares");

router.get("/", authMiddleware, queryHandler, async (req, res) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.render("homepage", {
      title: "HNG Store - Thời trang nam tối giản",
      categories: Array.isArray(categories) ? categories : [categories],
      user: req.user,
    });
  } catch (error) {
    res.json({ message: "ERROR HOMEPAGE", error: error });
  }
});


module.exports = router;
