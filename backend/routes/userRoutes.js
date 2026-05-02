const express = require("express");
const router = express.Router();
const { getUsers, addUser, updateUser, deleteUser } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.get("/", protect, adminOnly, getUsers);
router.post("/", protect, adminOnly, addUser);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);
module.exports = router;
