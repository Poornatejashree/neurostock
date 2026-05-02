const express = require("express");
const { protect } = require("../middleware/authMiddleware");

// Audit Routes
const auditRouter = express.Router();
const { getLogs } = require("../controllers/auditController");
auditRouter.get("/", protect, getLogs);
exports.auditRoutes = auditRouter;

// Notification Routes
const notifRouter = express.Router();
const { getNotifications, markRead, markAllRead } = require("../controllers/notificationController");
notifRouter.get("/", protect, getNotifications);
notifRouter.put("/:id/read", protect, markRead);
notifRouter.put("/mark-all-read", protect, markAllRead);
exports.notificationRoutes = notifRouter;

// AI Routes
const aiRouter = express.Router();
aiRouter.post("/query", protect, async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: context,
        messages: [{ role: "user", content: message }],
      }),
    });
    const data = await response.json();
    res.json({ reply: data.content?.[0]?.text || "Unable to process your query." });
  } catch (e) {
    res.status(500).json({ message: "AI service unavailable", error: e.message });
  }
});
exports.aiRoutes = aiRouter;
