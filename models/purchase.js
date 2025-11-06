const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema({
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: Number,
  subtotalDelivery: Number,
  subtotalDiscount: Number,
  fee: Number,

  orderType: String,
  branchCode: String,
  PaymentMethod: String,

  seller: String, // 👈 حقل البائع

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Purchase = mongoose.model("Purchase", PurchaseSchema);
module.exports = Purchase;
