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

const InvoiceAllSchema = new mongoose.Schema({
  invoiceNumber: String,
  customerName: String,
  date: Date,
  items: [ItemSchema],
  discount: Number,
  total: Number,
  source: String,
  cabang: String, // bgr01, spl01, ...
  paymentMethod: String, // "cash" | "transfer" | "qris" | "" | null
});

module.exports = mongoose.model("invoiceall", InvoiceAllSchema);
