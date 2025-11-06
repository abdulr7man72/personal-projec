const express = require('express');
const router = express.Router();
const Menu = require('../models/menu'); // تأكّد من المسار الصحيح للسكيمة


router.get('/pos', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.render('pos', { menu });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});







module.exports = router;
