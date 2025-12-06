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
      paymentMethod: inv.paymentMethod,
      cabang: inv.cabang || cabang,
    });

    await InvoiceAll.findByIdAndDelete(req.params.id);

    res.redirect(`/${cabang}/invoiceall`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error finishing invoice");
  }
});

router.get("/invoice/:cabang/stats", async (req, res) => {
  try {
    const cabangParam = req.params.cabang;
    
    // شرط البحث
    let query = {};
    if (cabangParam !== "all") {
      query.cabang = cabangParam;
    }

    const list = await InvoiceDone
      .find(query)
      .sort({ finishedAt: -1 });

    let totalInvoices = list.length;
    let totalAmount = 0;
    let totalDiscount = 0;
    const statsBySource = {}; 

    // تجميع البيانات للكروت
    list.forEach((inv) => {
      totalAmount += inv.total || 0;
      totalDiscount += inv.discount || 0;

      // المنطق المطلوب: إذا كان instore نأخذ paymentMethod، وإلا نأخذ source
      let sourceName = inv.source || "Unknown";
      if (sourceName.toLowerCase() === "instore") {
         // تأكد أن لديك حقل paymentMethod في السكيما، أو سيظهر Unknown
         sourceName = inv.paymentMethod || "Cash (Instore)"; 
      }

      if (!statsBySource[sourceName]) {
          statsBySource[sourceName] = { count: 0, total: 0 };
      }
      statsBySource[sourceName].count += 1;
      statsBySource[sourceName].total += inv.total || 0;
    });

    // استخراج قائمة الفروع الموجودة فعلياً في البيانات للفلتر
    const uniqueBranches = [...new Set(list.map(item => item.cabang))];

    res.render("invoiceStats", {
      title: cabangParam === "all" ? "Statistik Semua Cabang" : `Statistik - ${cabangParam}`,
      cabang: cabangParam,
      list,
      uniqueBranches, // نرسل قائمة الفروع للفلتر
      totalInvoices,
      totalAmount,
      totalDiscount,
      statsBySource,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading stats");
  }
});

// ✏️ صفحة تعديل الفاتورة
router.get("/:cabang/invoiceall/:id/edit", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    const invoice = await InvoiceAll.findById(req.params.id);

    if (!invoice) {
      return res.redirect(`/${cabang}/invoiceall`);
    }

    res.render("invoiceall-edit", {
      title: `Edit Invoice – ${invoice.invoiceNumber}`,
      cabang,
      invoice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading edit page");
  }
});

// 💾 حفظ التعديلات
router.post("/:cabang/invoiceall/:id/edit", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    const { invoiceNumber, customerName, discount, total, paymentMethod, date } = req.body;

    await InvoiceAll.findByIdAndUpdate(req.params.id, {
      invoiceNumber,
      customerName,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      paymentMethod,
      date: date ? new Date(date) : undefined,
    });

    res.redirect(`/${cabang}/invoiceall`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating invoice");
  }
});

module.exports = router;
