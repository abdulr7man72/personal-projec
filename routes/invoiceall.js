const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");

// InvoiceAll
router.get("/:cabang/invoiceall", invoiceController.getInvoiceAllPage);
router.get("/:cabang/invoiceall/json", invoiceController.getInvoiceAllJson);
router.post("/:cabang/invoiceall/:id/delete", invoiceController.deleteInvoiceAll);
router.get("/:cabang/invoiceall/:id/edit", invoiceController.getEditInvoiceAllPage);
router.post("/:cabang/invoiceall/:id/edit", invoiceController.updateInvoiceAll);
router.post("/:cabang/invoiceall/:id/done", invoiceController.markInvoiceDone);

// InvoiceDone Stats
router.get("/invoice/:cabang/stats", invoiceController.getInvoiceStatsPage);
router.post("/invoice/:cabang/:id/delete", invoiceController.deleteInvoiceDone);

module.exports = router;
