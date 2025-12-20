const InvoiceAll = require("../models/invoiceall");
const InvoiceDone = require("../models/invoiceDone");

// Helpers
const safeNumber = (v) => (Number.isFinite(+v) ? +v : 0);

// Wrapper لتقليل تكرار try/catch
const wrap = (fn) => async (req, res) => {
  try { return await fn(req, res); }
  catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
};

// =============================
// InvoiceAll
// =============================

// GET /:cabang/invoiceall
exports.getInvoiceAllPage = wrap(async (req, res) => {
  const cabang = req.params.cabang;
  const invoices = await InvoiceAll.find({ cabang }).sort({ _id: -1 });

  return res.render("invoiceall", {
    title: `Invoices – ${cabang}`,
    cabang,
    invoices,
  });
});

// GET /:cabang/invoiceall/json
exports.getInvoiceAllJson = wrap(async (req, res) => {
  const cabang = req.params.cabang;
  const invoices = await InvoiceAll.find({ cabang }).sort({ _id: -1 });
  return res.json(invoices);
});

// POST /:cabang/invoiceall/:id/delete
exports.deleteInvoiceAll = wrap(async (req, res) => {
  const { cabang, id } = req.params;
  await InvoiceAll.findByIdAndDelete(id);
  return res.redirect(`/${cabang}/invoiceall`);
});

// GET /:cabang/invoiceall/:id/edit
exports.getEditInvoiceAllPage = wrap(async (req, res) => {
  const { cabang, id } = req.params;
  const invoice = await InvoiceAll.findById(id);
  if (!invoice) return res.redirect(`/${cabang}/invoiceall`);

  return res.render("invoiceall-edit", {
    title: `Edit Invoice – ${invoice.invoiceNumber}`,
    cabang,
    invoice,
  });
});

// POST /:cabang/invoiceall/:id/edit
exports.updateInvoiceAll = wrap(async (req, res) => {
  const { cabang, id } = req.params;
  const b = req.body;

  const update = {
    invoiceNumber: b.invoiceNumber,
    modalChangeCash: b.modalChangeCash,
    modalPaidCash: b.modalPaidCash,
    customerName: b.customerName,
    discount: safeNumber(b.discount),
    total: safeNumber(b.total),
    paymentMethod: b.paymentMethod,
    ...(b.date ? { date: new Date(b.date) } : {}),
  };

  await InvoiceAll.findByIdAndUpdate(id, update);
  return res.redirect(`/${cabang}/invoiceall`);
});

// POST /:cabang/invoiceall/:id/done
exports.markInvoiceDone = wrap(async (req, res) => {
  const { cabang, id } = req.params;

  const inv = await InvoiceAll.findById(id);
  if (!inv) return res.redirect(`/${cabang}/invoiceall`);

  await InvoiceDone.create({
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customerName,
    modalChangeCash: inv.modalChangeCash,
    modalPaidCash: inv.modalPaidCash,
    date: inv.date,
    items: inv.items,
    discount: inv.discount,
    total: inv.total,
    source: inv.source,
    paymentMethod: inv.paymentMethod,
    cabang: inv.cabang || cabang,
    // finishedAt: new Date(), // إذا عندك الحقل في schema
  });

  await InvoiceAll.findByIdAndDelete(id);
  return res.redirect(`/${cabang}/invoiceall`);
});

// =============================
// InvoiceDone Stats
// =============================

// GET /invoice/:cabang/stats
exports.getInvoiceStatsPage = wrap(async (req, res) => {
  const cabang = req.params.cabang;
  const query = cabang === "all" ? {} : { cabang };

  const list = await InvoiceDone.find(query).sort({ finishedAt: -1, _id: -1 });

  const stats = list.reduce(
    (acc, inv) => {
      acc.totalAmount += inv.total || 0;
      acc.totalDiscount += inv.discount || 0;

      let key = inv.source || "Unknown";
      if ((key || "").toLowerCase() === "instore") key = inv.paymentMethod || "Cash (Instore)";

      (acc.statsBySource[key] ||= { count: 0, total: 0 });
      acc.statsBySource[key].count += 1;
      acc.statsBySource[key].total += inv.total || 0;

      if (inv.cabang) acc.branchSet.add(inv.cabang);
      return acc;
    },
    { totalAmount: 0, totalDiscount: 0, statsBySource: {}, branchSet: new Set() }
  );

  return res.render("invoiceStats", {
    title: cabang === "all" ? "Statistik Semua Cabang" : `Statistik - ${cabang}`,
    cabang,
    list,
    uniqueBranches: [...stats.branchSet],
    totalInvoices: list.length,
    totalAmount: stats.totalAmount,
    totalDiscount: stats.totalDiscount,
    statsBySource: stats.statsBySource,
  });
});

// POST /invoice/:cabang/:id/delete
exports.deleteInvoiceDone = wrap(async (req, res) => {
  const { cabang, id } = req.params;
  await InvoiceDone.findByIdAndDelete(id);
  return res.redirect(`/invoice/${cabang}/stats`);
});
