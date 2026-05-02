const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  category: { type: String, default: "General" },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  reorderLevel: { type: Number, default: 5 },
  warehouse: { type: String, default: "Warehouse A" },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  supplier: { type: String },
  imageUrl: { type: String },
}, { timestamps: true });

// Index for performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ quantity: 1 });

module.exports = mongoose.model("Product", ProductSchema);
