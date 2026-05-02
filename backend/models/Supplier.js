const mongoose = require("mongoose");
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  phone: { type: String },
  address: { type: String },
  category: { type: String },
  leadTimeDays: { type: Number },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  notes: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("Supplier", SupplierSchema);
