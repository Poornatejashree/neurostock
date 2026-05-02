// emailService.js — Nodemailer email alerts
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (not your normal password)
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping email send");
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"NeuroStock Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${subject}`);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
}

// ─── Email Templates ──────────────────────────────

exports.sendLowStockAlert = async (product) => {
  const adminEmail = process.env.ALERT_EMAIL || process.env.EMAIL_USER;
  await sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock Alert: ${product.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:24px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#58a6ff,#bc8cff);padding:16px 20px;border-radius:8px;margin-bottom:20px">
          <h2 style="margin:0;color:#fff">⚠️ Low Stock Alert</h2>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">NeuroStock Smart Inventory System</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          ${[
            ["Product", product.name],
            ["SKU", product.sku || "—"],
            ["Category", product.category || "—"],
            ["Warehouse", product.warehouse || "—"],
            ["Current Stock", `<strong style="color:#f0883e">${product.quantity} units</strong>`],
            ["Reorder Level", product.reorderLevel || 5],
          ].map(([k, v]) => `
            <tr>
              <td style="padding:10px 12px;background:#161b22;border-bottom:1px solid #30363d;color:#8b949e;font-size:13px;width:40%">${k}</td>
              <td style="padding:10px 12px;background:#161b22;border-bottom:1px solid #30363d;font-size:13px">${v}</td>
            </tr>
          `).join("")}
        </table>
        <div style="margin-top:20px;padding:14px;background:#161b22;border-radius:8px;border:1px solid #f0883e">
          <p style="margin:0;color:#f0883e;font-size:13px">🔔 Action required: Please reorder <strong>${product.name}</strong> to avoid stockout.</p>
        </div>
        <p style="margin-top:16px;font-size:11px;color:#656d76;text-align:center">NeuroStock — Smart Inventory System</p>
      </div>
    `,
  });
};

exports.sendOutOfStockAlert = async (product) => {
  const adminEmail = process.env.ALERT_EMAIL || process.env.EMAIL_USER;
  await sendEmail({
    to: adminEmail,
    subject: `🚨 OUT OF STOCK: ${product.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:24px;border-radius:12px">
        <div style="background:#f85149;padding:16px 20px;border-radius:8px;margin-bottom:20px">
          <h2 style="margin:0;color:#fff">🚨 Out of Stock!</h2>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">${product.name} has run out of stock</p>
        </div>
        <p style="color:#8b949e;font-size:13px">Immediate reorder required. Product: <strong style="color:#e6edf3">${product.name}</strong> in ${product.warehouse || "Warehouse"}.</p>
        <p style="margin-top:16px;font-size:11px;color:#656d76;text-align:center">NeuroStock — Smart Inventory System</p>
      </div>
    `,
  });
};

exports.sendLoginAlert = async (user, ip) => {
  await sendEmail({
    to: user.email,
    subject: "🔑 New Login to Your NeuroStock Account",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:24px;border-radius:12px">
        <h2 style="color:#58a6ff">🔑 Login Detected</h2>
        <p style="color:#8b949e;font-size:13px">A new login was detected on your NeuroStock account.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${[
            ["User", user.name],
            ["Email", user.email],
            ["Role", user.role],
            ["Time", new Date().toLocaleString()],
            ["IP", ip || "Unknown"],
          ].map(([k, v]) => `
            <tr>
              <td style="padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d;color:#8b949e;font-size:13px;width:35%">${k}</td>
              <td style="padding:8px 12px;background:#161b22;border-bottom:1px solid #30363d;font-size:13px">${v}</td>
            </tr>
          `).join("")}
        </table>
        <p style="color:#8b949e;font-size:12px">If this wasn't you, change your password immediately.</p>
      </div>
    `,
  });
};

exports.sendExpiryAlert = async (products) => {
  const adminEmail = process.env.ALERT_EMAIL || process.env.EMAIL_USER;
  await sendEmail({
    to: adminEmail,
    subject: `⏳ Expiry Alert: ${products.length} products expiring soon`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0d1117;color:#e6edf3;padding:24px;border-radius:12px">
        <h2 style="color:#f0883e">⏳ Expiry Alert</h2>
        <p style="color:#8b949e;font-size:13px">${products.length} products are expiring within the next 7 days.</p>
        ${products.map((p) => `
          <div style="padding:12px;background:#161b22;border:1px solid #f0883e;border-radius:8px;margin-bottom:8px">
            <strong>${p.name}</strong> — expires ${new Date(p.expiryDate).toLocaleDateString()} 
            <span style="color:#f0883e">(${p.quantity} units remaining)</span>
          </div>
        `).join("")}
      </div>
    `,
  });
};
