const Product = require("../models/Product");

const getSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    });

    const lowStockCount = lowStockProducts.length;

    const outOfStock = await Product.countDocuments({
      quantity: 0,
    });

    const products = await Product.find();

    const totalInventoryValue = products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    res.json({
      totalProducts,
      lowStockCount,
      outOfStock,
      totalInventoryValue,
      lowStockProducts, // 👈 ADD HERE
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary };
