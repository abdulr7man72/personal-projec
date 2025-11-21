const express = require("express");
const router = express.Router();
const MenuItem = require("../models/menu");       // منيو
const InvoiceAll = require("../models/invoiceall"); // الفواتير

// 🧾 صفحة الـ POS لفرع معيّن
router.get("/:cabang/pos", async (req, res) => {
  try {
    const cabang = req.params.cabang; // bgr01 / spl01
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });

    res.render("pos", {
      title: `POS – ${cabang}`,
      cabang,
      menuItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading POS page");
  }
});

// 💾 استلام الطلب وتخزينه في invoiceall
router.post("/:cabang/pos", async (req, res) => {
  try {
    const cabang = req.params.cabang;
    const { customerName, source, discount, itemsJson, paymentMethod } = req.body;

    if (!itemsJson) {
      return res.status(400).send("Keranjang kosong.");
    }

    let itemsRaw = [];
    try {
      itemsRaw = JSON.parse(itemsJson);
    } catch (e) {
      console.error("Error parsing itemsJson:", itemsJson, e);
      return res.status(400).send("Format data items tidak valid.");
    }

    if (!Array.isArray(itemsRaw) || !itemsRaw.length) {
      return res.status(400).send("Keranjang kosong.");
    }

    const items = itemsRaw.map((it) => ({
      name: it.name,
      unitPrice: Number(it.unitPrice) || 0,
      quantity: Number(it.quantity) || 0,
      note: it.note || "",
      addons: Array.isArray(it.addons) ? it.addons : [],
      subtotal: Number(it.subtotal) || 0,
    }));

    const subtotal = items.reduce((sum, it) => sum + (it.subtotal || 0), 0);
    const disc = Number(discount) || 0;
    const total = Math.max(0, subtotal - disc);

    // 🔢 رقم فاتورة:
    // - In-Store: P-#### (4 أرقام قصيرة)
    // - غير In-Store: فاضي
    const src = source || "inStore";
    let invoiceNumber = "";
    if (src === "inStore") {
      const short = Date.now().toString().slice(-4); // آخر 4 أرقام
      invoiceNumber = `P-${short}`;
    }

    await InvoiceAll.create({
      invoiceNumber,
      customerName: customerName || "",
      date: new Date(),
      items,
      discount: disc,
      total,
      source: src,
      cabang,
      paymentMethod: src === "inStore" ? (paymentMethod || "cash") : "",
    });

    res.redirect(`/${cabang}/invoiceall`);
  } catch (err) {
    console.error("❌ Error saving POS invoice:", err);
    res.status(500).send("Error saving POS invoice: " + err.message);
  }
});


module.exports = router;
