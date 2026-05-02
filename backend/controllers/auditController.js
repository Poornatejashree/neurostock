const AuditLog = require("../models/AuditLog");

exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createLog = async ({ user, action, entity, entityName, oldValue, newValue, description }) => {
  try {
    await new AuditLog({ user, action, entity, entityName, oldValue: String(oldValue || ""), newValue: String(newValue || ""), description }).save();
  } catch (e) { console.error("Audit log error:", e.message); }
};
