const Product = require("../models/Product");
const { createLog } = require("./auditController");
const { createNotification } = require("./notificationController");
const { sendLowStockAlert, sendOutOfStockAlert } = require("../services/emailService");

const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await createLog({ user: req.user?.name || "Admin", action: "CREATE", entity: "Product", entityName: product.name, description: `New product added: ${product.name}` });
    // Broadcast to all connected clients
    req.app.get("io")?.to("all-users").emit("stock-update", { message: `New product added: ${product.name}`, type: "success" });
    res.json(product);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getProducts = async (req, res) => {
  try { res.json(await Product.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const old = await Product.findById(req.params.id);
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const userName = req.user?.name || "Admin";
    const io = req.app.get("io");

    if (old && updated && old.quantity !== updated.quantity) {
      await createLog({ user: userName, action: "UPDATE", entity: "Product", entityName: updated.name, oldValue: old.quantity, newValue: updated.quantity, description: `${userName} updated stock of ${updated.name}: ${old.quantity} → ${updated.quantity}` });

      if (updated.quantity === 0) {
        await createNotification({ message: `Out of stock: ${updated.name}`, type: "danger", icon: "🚨" });
        io?.to("all-users").emit("out-of-stock", { message: `🚨 Out of stock: ${updated.name}`, type: "danger" });
        await sendOutOfStockAlert(updated).catch(console.error);
      } else if (updated.quantity <= (updated.reorderLevel || 5)) {
        await createNotification({ message: `Low stock: ${updated.name} (${updated.quantity} left)`, type: "warning", icon: "⚠️" });
        io?.to("all-users").emit("low-stock-alert", { message: `⚠️ Low stock: ${updated.name} (${updated.quantity} left)`, type: "warning" });
        await sendLowStockAlert(updated).catch(console.error);
      } else {
        io?.to("all-users").emit("stock-update", { message: `Stock updated: ${updated.name} → ${updated.quantity} units`, type: "info" });
      }
    } else {
      await createLog({ user: userName, action: "UPDATE", entity: "Product", entityName: updated.name, description: `${userName} updated product: ${updated.name}` });
    }
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    await Product.findByIdAndDelete(req.params.id);
    await createLog({ user: req.user?.name || "Admin", action: "DELETE", entity: "Product", entityName: product?.name, description: `Product deleted: ${product?.name}` });
    req.app.get("io")?.to("admins").emit("notification", { message: `Product deleted: ${product?.name}`, type: "warning" });
    res.json({ message: "Product deleted successfully" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } });
    res.json(products);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { addProduct, getProducts, updateProduct, deleteProduct, getLowStockProducts };
