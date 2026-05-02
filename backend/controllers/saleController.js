const Product = require("../models/Product");
const Sale = require("../models/Sale");

const createSale = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantitySold) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Reduce stock
    product.quantity -= quantitySold;
    await product.save();

    const totalPrice = product.price * quantitySold;

    const sale = new Sale({
      product: product._id,
      quantitySold,
      totalPrice,
      soldBy: req.user.id,
    });

    await sale.save();

    res.status(201).json({
      message: "Sale recorded successfully",
      sale,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product", "name price")
      .populate("soldBy", "name email");

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSale, getSales };
