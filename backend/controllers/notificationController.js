const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try { res.json(await Notification.find().sort({ createdAt: -1 }).limit(50)); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.markRead = async (req, res) => {
  try { await Notification.findByIdAndUpdate(req.params.id, { read: true }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.markAllRead = async (req, res) => {
  try { await Notification.updateMany({ read: false }, { read: true }); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createNotification = async ({ message, type = "info", icon }) => {
  try { await new Notification({ message, type, icon }).save(); }
  catch (e) { console.error("Notification error:", e.message); }
};
