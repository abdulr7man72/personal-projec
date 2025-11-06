// routes/menus.js
const express = require('express');
const router = express.Router();
const Menu = require('../models/menu'); // تأكّد من المسار الصحيح للسكيمة

// قائمة المنيو
router.get('/menus', async (req, res) => {
  try {
    const menus = await Menu.find().lean();
    res.render('menus/index', { menus });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// صفحة إنشاء صنف جديد
router.get('/menus/new', (req, res) => {
  res.render('menus/new');
});

// حفظ صنف جديد
router.post('/menus', async (req, res) => {
  try {
    // نتوقع جسم الطلب بنفس شكل السكيمة:
    // { name, prices:{inStore,goFood,grabFood,shopeeFood}, addons:[{name, prices:{...}}], catagory, imageUrl }
    const doc = await Menu.create(req.body);

    // لو الإرسال كان JSON (fetch) رجع JSON
    if (req.headers['content-type']?.includes('application/json')) {
      return res.json(doc);
    }
    // غير ذلك رجّع توجيه
    res.redirect('/menus');
  } catch (err) {
    console.error(err);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(400).send(err.message);
  }
});

// API: رجوع JSON (مفيد للـfrontend)
router.get('/api/menus', async (req, res) => {
  try {
    const menus = await Menu.find().lean();
    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------- (اختياري) عمليات إضافية CRUD ---------------- */

// عرض عنصر واحد
router.get('/menus/:id', async (req, res) => {
  try {
    const m = await Menu.findById(req.params.id).lean();
    if (!m) return res.status(404).send('Not found');
    res.render('menus/show', { m });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// صفحة تعديل
router.get('/menus/:id/edit', async (req, res) => {
  try {
    const m = await Menu.findById(req.params.id).lean();
    if (!m) return res.status(404).send('Not found');
    res.render('menus/edit', { m });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// تحديث (PUT بديلًا بـ POST لتبسيط)
router.post('/menus/:id', async (req, res) => {
  try {
    const m = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.headers['content-type']?.includes('application/json')) {
      return res.json(m);
    }
    res.redirect('/menus');
  } catch (err) {
    console.error(err);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(400).send(err.message);
  }
});

// حذف
router.post('/menus/:id/delete', async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.json({ ok: true });
    }
    res.redirect('/menus');
  } catch (err) {
    console.error(err);
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(400).send(err.message);
  }
});

module.exports = router;
