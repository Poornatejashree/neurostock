require("dotenv").config();

const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("SERVER FILE RUNNING:", __filename);

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const saleRoutes = require("./routes/saleRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const userRoutes = require("./routes/userRoutes");
const { auditRoutes, notificationRoutes, aiRoutes } = require("./routes/miscRoutes");

const app = express();
const server = http.createServer(app); // Wrap express with http for Socket.IO

// ─── Socket.IO Setup ──────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Make io accessible in controllers
app.set("io", io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.user?.name} (${socket.id})`);
  socket.join("all-users");
  if (socket.user?.role === "admin") socket.join("admins");

  socket.on("disconnect", () => {
    console.log(`🔌 Disconnected: ${socket.user?.name}`);
  });
});

// Helper: broadcast notification to all connected clients
global.emitNotification = (event, data) => {
  io.to("all-users").emit(event, data);
};

// ─── Middleware ──────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health check ────────────────────────────────
app.get("/", (req, res) => res.send("NeuroStock Backend Running ✅"));
app.get("/test-direct", (req, res) => res.send("DIRECT ROUTE WORKING"));

// ─── MongoDB ─────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ─── Scheduled: Check expiry daily ───────────────
const checkExpiry = async () => {
  try {
    const Product = require("./models/Product");
    const { sendExpiryAlert } = require("./services/emailService");
    const expiring = await Product.find({
      expiryDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), $gte: new Date() },
      quantity: { $gt: 0 },
    });
    if (expiring.length > 0) {
      await sendExpiryAlert(expiring);
      global.emitNotification?.("notification", {
        message: `⏳ ${expiring.length} products expiring within 7 days`,
        type: "warning", icon: "⏳",
      });
    }
  } catch (e) { console.error("Expiry check error:", e.message); }
};

// Run expiry check every 24 hours
setInterval(checkExpiry, 24 * 60 * 60 * 1000);
setTimeout(checkExpiry, 10000); // Run 10s after startup

// ─── Routes ──────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/products",      productRoutes);
app.use("/api/sales",         saleRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/suppliers",     supplierRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/audit",         auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai",            aiRoutes);

// ─── Start server ─────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with Socket.IO`));
