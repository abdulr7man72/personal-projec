const express = require('express');
const router = express.Router();
const Purchase = require('../models/purchase');

// GET /purchases  (list + filters + stats)
router.get('/purchases', async (req, res) => {
  const { from, to, branch, payment } = req.query || {};
  const filter = {};

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to)   filter.createdAt.$lte = new Date(to);
  }
  if (branch) filter.branchCode = branch;
  if (payment) filter.PaymentMethod = payment;

  const purchases = await Purchase.find(filter).sort({ createdAt: -1 }).lean();

  // Stats
  const sum = (arr, sel) => arr.reduce((s, x) => s + (Number(sel(x)) || 0), 0);
  const totalSum           = sum(purchases, p => p.total);
  const deliverySum        = sum(purchases, p => p.subtotalDelivery);
  const discountSum        = sum(purchases, p => p.subtotalDiscount);
  const feeSum             = sum(purchases, p => p.fee);
  const count              = purchases.length;

  res.render('purchases/index', {
    purchases,
    filters: { from, to, branch, payment },
    stats: { totalSum, deliverySum, discountSum, feeSum, count }
  });
});

// POST /purchases  (create)
router.post('/purchases', async (req, res) => {
  try {
    const body = req.body || {};
    // السماح بإدخال createdAt يدوياً
    if (body.createdAt) body.createdAt = new Date(body.createdAt);

    const doc = await Purchase.create(body);

    if (req.headers['content-type']?.includes('application/json')) {
      return res.json(doc);
    }
    res.redirect('/purchases');
  } catch (err) {
    console.error(err);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(400).send(err.message);
  }
});

module.exports = router;
