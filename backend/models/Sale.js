const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantitySold: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", SaleSchema);
