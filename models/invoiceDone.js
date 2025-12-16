const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: String,
    unitPrice: Number,
    quantity: Number,
    note: String,
    addons: [String],
    subtotal: Number,
  },
  { _id: false }
);

const InvoiceDoneSchema = new mongoose.Schema({
  invoiceNumber: String,
  customerName: String,
  date: Date,
  items: [ItemSchema],
  discount: Number,
  total: Number,
  source: String,
  cabang: String,             // نفس cabang
  paymentMethod: String,     // "cash" | "transfer" | "qris" | "" | null
  modalPaidCash: Number,
  modalChangeCash: Number,
  finishedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("invoicedone", InvoiceDoneSchema);
