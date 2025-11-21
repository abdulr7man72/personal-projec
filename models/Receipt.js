const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    date_raw: String,         // النص الخام للتاريخ من الـ OCR
    date: Date,               // لو خزّنته كتاريخ
    seller: String,

    items: [
      {
        name: String,
        quantity: Number,
        price: Number
      }
    ],

    discount_total: Number,
    grand_total: Number,
    payment_method: String,
    amount_paid: Number,
    change_amount: Number,
    source: String             // مثلاً: "ocr_claude" أو غيره
  },
  {
    collection: "receipts_ocr" // مهم جداً > نفس اسم الـ collection في MongoDB
  }
);

module.exports = mongoose.model("Receipt", receiptSchema);
