// whatsappService.js — WhatsApp alerts via Twilio
const twilio = require("twilio");

let client = null;

function getClient() {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

async function sendWhatsApp(to, message) {
  const c = getClient();
  if (!c) {
    console.log("⚠️ Twilio not configured — skipping WhatsApp");
    return;
  }
  try {
    await c.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, // e.g. whatsapp:+14155238886
      to: `whatsapp:${to}`,                                  // e.g. whatsapp:+919999999999
      body: message,
    });
    console.log(`📱 WhatsApp sent to ${to}`);
  } catch (err) {
    console.error("❌ WhatsApp error:", err.message);
  }
}

// ─── Alert Templates ──────────────────────────────

exports.sendLowStockWhatsApp = async (product) => {
  const to = process.env.ALERT_WHATSAPP; // your number e.g. +919999999999
  if (!to) return;
  await sendWhatsApp(to,
    `⚠️ *NeuroStock Low Stock Alert*\n\n` +
    `Product: *${product.name}*\n` +
    `SKU: ${product.sku || "—"}\n` +
    `Warehouse: ${product.warehouse || "—"}\n` +
    `Current Stock: *${product.quantity} units*\n` +
    `Reorder Level: ${product.reorderLevel || 5}\n\n` +
    `🔔 Please reorder immediately to avoid stockout.`
  );
};

exports.sendOutOfStockWhatsApp = async (product) => {
  const to = process.env.ALERT_WHATSAPP;
  if (!to) return;
  await sendWhatsApp(to,
    `🚨 *NeuroStock OUT OF STOCK*\n\n` +
    `Product: *${product.name}* is completely out of stock!\n` +
    `Warehouse: ${product.warehouse || "—"}\n\n` +
    `❗ Immediate reorder required.`
  );
};

exports.sendSaleWhatsApp = async (sale, product) => {
  const to = process.env.ALERT_WHATSAPP;
  if (!to) return;
  await sendWhatsApp(to,
    `💰 *NeuroStock Sale Recorded*\n\n` +
    `Product: *${product.name}*\n` +
    `Qty Sold: ${sale.quantitySold}\n` +
    `Total: $${sale.totalPrice?.toFixed(2)}\n` +
    `Remaining Stock: ${product.quantity}`
  );
};

exports.sendDailyReport = async (analytics) => {
  const to = process.env.ALERT_WHATSAPP;
  if (!to) return;
  await sendWhatsApp(to,
    `📊 *NeuroStock Daily Report*\n\n` +
    `Total Products: ${analytics.totalProducts}\n` +
    `Inventory Value: $${analytics.totalInventoryValue?.toFixed(2)}\n` +
    `Low Stock Items: ${analytics.lowStockCount}\n` +
    `Out of Stock: ${analytics.outOfStock}\n\n` +
    `Have a great day! 🚀`
  );
};
