const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ["warning","danger","success","info"], default: "info" },
  icon: { type: String },
  read: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
module.exports = mongoose.model("Notification", NotificationSchema);
