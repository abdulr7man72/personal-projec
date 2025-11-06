const mongoose = require("mongoose");

// تعريف سكّيما الفاتورة
const InvoiceSchema = new mongoose.Schema({
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      addons: [
        {
          name: String,
          price: Number,
        },
      ],
    },
  ],

  // باقي البيانات (مثلاً)
  category: String,
  discount: Number,
  total: Number,
  orderType: String,
  seller: String,
  branchCode: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// إنشاء الموديل
const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;
