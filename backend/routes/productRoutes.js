const express = require("express");
const router = express.Router();
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");

router.get("/low-stock", protect, getLowStockProducts);
router.get("/", protect, getProducts);
router.post("/", protect, addProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;
