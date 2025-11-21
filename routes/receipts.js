// routes/receipts.js
const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");

// GET / أو تقدر تغيّر المسار مثلاً /receipts
router.get("/receipts", async (req, res) => {
  try {
    // جلب الفواتير من الأحدث للأقدم
    const receipts = await Receipt.find().sort({ date: -1, _id: -1 });

    const totalInvoices = receipts.length;

    const sum = (arr, key) =>
      arr.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

    const totalGrand = sum(receipts, "grand_total");
    const totalDiscount = sum(receipts, "discount_total");
    const totalPaid = sum(receipts, "amount_paid");
    const totalChange = sum(receipts, "change_amount");

    // تجميع حسب طريقة الدفع
    const byPayment = {};
    receipts.forEach((r) => {
      const method = r.payment_method || "غير محدد";
      if (!byPayment[method]) {
        byPayment[method] = { count: 0, total: 0 };
      }
      byPayment[method].count += 1;
      byPayment[method].total += Number(r.grand_total) || 0;
    });

    res.render("receipts", {
      receipts,
      stats: {
        totalInvoices,
        totalGrand,
        totalDiscount,
        totalPaid,
        totalChange,
        byPayment,
      },
    });
  } catch (err) {
    console.error("Error loading receipts:", err);
    res.status(500).send("حدث خطأ أثناء جلب الفواتير");
  }
});

// 📥 تحميل CSV جاهز لـ Google Sheets
router.get("/receipts/export", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ date: -1, _id: -1 });

    const rows = [];
    // عنوان الأعمدة
    rows.push([
      "date",
      "seller",
      "item_name",
      "quantity",
      "price",
      "grand_total",
      "discount_total",
      "payment_method",
      "amount_paid",
      "change_amount"
    ]);

    receipts.forEach(r => {
      const base = {
        date: r.date_raw || r.date || "",
        seller: r.seller || "",
        grand_total: Number(r.grand_total) || 0,
        discount_total: Number(r.discount_total) || 0,
        payment_method: r.payment_method || "",
        amount_paid: Number(r.amount_paid) || 0,
        change_amount: Number(r.change_amount) || 0
      };

      if (r.items && r.items.length) {
        r.items.forEach(it => {
          rows.push([
            base.date,
            base.seller,
            it.name || "",
            it.quantity || 0,
            Number(it.price) || 0,
            base.grand_total,
            base.discount_total,
            base.payment_method,
            base.amount_paid,
            base.change_amount
          ]);
        });
      } else {
        rows.push([
          base.date,
          base.seller,
          "",
          "",
          "",
          base.grand_total,
          base.discount_total,
          base.payment_method,
          base.amount_paid,
          base.change_amount
        ]);
      }
    });

    const csv = rows
      .map(row =>
        row
          .map(val =>
            `"${String(val ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=\"receipts_ocr.csv\""
    );
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).send("خطأ أثناء تجهيز ملف CSV");
  }
});

// صفحة تعديل فاتورة
router.get("/receipts/:id/edit", async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).send("الفاتورة غير موجودة");

    res.render("receipt-edit", { receipt });
  } catch (err) {
    console.error("Edit load error:", err);
    res.status(500).send("خطأ أثناء تحميل صفحة التعديل");
  }
});

router.post("/receipts/:id/edit", async (req, res) => {
  try {
    const { date_raw, seller, grand_total, discount_total, payment_method, amount_paid, change_amount } = req.body;

    await Receipt.findByIdAndUpdate(
      req.params.id,
      {
        date_raw,
        seller,
        grand_total: Number(grand_total) || 0,
        discount_total: Number(discount_total) || 0,
        payment_method,
        amount_paid: Number(amount_paid) || 0,
        change_amount: Number(change_amount) || 0,
      },
      { runValidators: false }
    );

    res.redirect("/receipts");
  } catch (err) {
    console.error("Edit save error:", err);
    res.status(500).send("خطأ أثناء حفظ التعديل");
  }
});

router.post("/receipts/:id/delete", async (req, res) => {
  try {
    await Receipt.findByIdAndDelete(req.params.id);
    res.redirect("/receipts");
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).send("خطأ أثناء حذف الفاتورة");
  }
});


module.exports = router;
