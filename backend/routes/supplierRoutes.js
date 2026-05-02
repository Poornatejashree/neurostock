// supplierRoutes.js
const express = require("express");
const router = express.Router();
const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");
router.get("/", protect, getSuppliers);
router.post("/", protect, addSupplier);
router.put("/:id", protect, updateSupplier);
router.delete("/:id", protect, deleteSupplier);
module.exports = router;
