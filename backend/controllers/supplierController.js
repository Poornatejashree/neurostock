const Supplier = require("../models/Supplier");

exports.getSuppliers = async (req, res) => {
  try { res.json(await Supplier.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addSupplier = async (req, res) => {
  try { const s = new Supplier(req.body); await s.save(); res.json(s); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateSupplier = async (req, res) => {
  try { res.json(await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteSupplier = async (req, res) => {
  try { await Supplier.findByIdAndDelete(req.params.id); res.json({ message: "Supplier deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
