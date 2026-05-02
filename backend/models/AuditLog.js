const mongoose = require("mongoose");
const AuditLogSchema = new mongoose.Schema({
  user: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, enum: ["CREATE","UPDATE","DELETE","SALE","LOGIN"], required: true },
  entity: { type: String },
  entityName: { type: String },
  oldValue: { type: String },
  newValue: { type: String },
  description: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model("AuditLog", AuditLogSchema);
