const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createLog } = require("./auditController");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isActive === false)
      return res.status(403).json({ message: "Account is disabled" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" },
    );

    await createLog({
      user: user.name,
      action: "LOGIN",
      entity: "Auth",
      description: `${user.name} logged in`,
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, // ← must be req.user.id (from JWT)
      { name, email, phone, bio, avatar },
      { new: true },
    ).select("-password");
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
