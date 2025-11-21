const express = require("express");
const router = express.Router();
const InvoiceAll = require("../models/invoiceall");
const InvoiceDone = require("../models/invoiceDone");

// 📄 صفحة الفواتير الحالية لفرع معيّن
router.get("/:cabang/invoiceall", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    const invoices = await InvoiceAll
      .find({ cabang })
      .sort({ _id: -1 }); // 👈 الأجدد أولاً (على اليسار)

    res.render("invoiceall", {
      title: `Invoices – ${cabang}`,
      cabang,
      invoices,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading invoices");
  }
});


// 📡 API يرجّع الفواتير كـ JSON (عشان التحديث الفوري)
router.get("/:cabang/invoiceall/json", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    const invoices = await InvoiceAll
      .find({ cabang })
      .sort({ _id: -1 }); // 👈 نفس الشيء: الأجدد أولاً

    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading invoices" });
  }
});


// 🗑 حذف فاتورة من invoiceall فقط
router.post("/:cabang/invoiceall/:id/delete", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    await InvoiceAll.findByIdAndDelete(req.params.id);
    res.redirect(`/${cabang}/invoiceall`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting invoice");
  }
});

// ✅ Selesai: انسخ الفاتورة إلى invoicedone ثم احذفها من invoiceall
router.post("/:cabang/invoiceall/:id/done", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    const inv = await InvoiceAll.findById(req.params.id);
    if (!inv) return res.redirect(`/${cabang}/invoiceall`);

    await InvoiceDone.create({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      date: inv.date,
      items: inv.items,
      discount: inv.discount,
      total: inv.total,
      source: inv.source,
      cabang: inv.cabang || cabang,
    });

    await InvoiceAll.findByIdAndDelete(req.params.id);

    res.redirect(`/${cabang}/invoiceall`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error finishing invoice");
  }
});

// 📊 صفحة الإحصائيات: تعتمد على invoicedone فقط
router.get("/:cabang/stats", async (req, res) => {
  try {
    const cabang = req.params.cabang;

    const list = await InvoiceDone
      .find({ cabang })
      .sort({ finishedAt: -1 }); // 👈 الأجدد في الأعلى

    let totalInvoices = list.length;
    let totalAmount = 0;
    let totalDiscount = 0;
    const bySource = {};

    list.forEach((inv) => {
      totalAmount += inv.total || 0;
      totalDiscount += inv.discount || 0;
      const src = inv.source || "unknown";
      if (!bySource[src]) bySource[src] = { count: 0, total: 0 };
      bySource[src].count += 1;
      bySource[src].total += inv.total || 0;
    });

    res.render("invoiceStats", {
      title: `Stats – ${cabang}`,
      cabang,
      list,
      totalInvoices,
      totalAmount,
      totalDiscount,
      bySource,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading stats");
  }
});


module.exports = router;
