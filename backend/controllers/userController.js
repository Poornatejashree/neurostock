const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
  try { res.json(await User.find().select("-password").sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.json({ message: "User created", user: { _id: user._id, name, email, role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) { updates.password = await bcrypt.hash(updates.password, 10); }
    else { delete updates.password; }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteUser = async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "User deleted" }); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
