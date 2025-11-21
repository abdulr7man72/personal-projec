const express = require("express");
const router = express.Router();
const MenuItem = require("../models/menu");

// صفحة إضافة منيو جديد
router.get("/menu/new", (req, res) => {
  res.render("menu-new", {
    title: "Add New Menu Item",
  });
});

// استلام البيانات وحفظها في MongoDB
router.post("/menu/new", async (req, res) => {
  try {
    // نستقبل البيانات من الفورم
    const {
      name,
      category,
      imageUrl,
      price_inStore,
      price_goFood,
      price_grabFood,
      price_shopeeFood,
    } = req.body;

    // Addons: جايين كـ arrays (أو undefined)
    const addonNames = req.body.addon_name || [];
    const addonInStore = req.body.addon_price_inStore || [];
    const addonGoFood = req.body.addon_price_goFood || [];
    const addonGrabFood = req.body.addon_price_grabFood || [];
    const addonShopeeFood = req.body.addon_price_shopeeFood || [];

    const addons = [];

    // نحولهم إلى objects
    for (let i = 0; i < addonNames.length; i++) {
      const n = addonNames[i];
      if (!n || !n.trim()) continue;

      addons.push({
        name: n.trim(),
        prices: {
          inStore: Number(addonInStore[i] || 0),
          goFood: Number(addonGoFood[i] || 0),
          grabFood: Number(addonGrabFood[i] || 0),
          shopeeFood: Number(addonShopeeFood[i] || 0),
        },
      });
    }

    const menuItem = new MenuItem({
      name: name?.trim(),
      category: category?.trim(),
      imageUrl: imageUrl?.trim(),
      prices: {
        inStore: Number(price_inStore || 0),
        goFood: Number(price_goFood || 0),
        grabFood: Number(price_grabFood || 0),
        shopeeFood: Number(price_shopeeFood || 0),
      },
      addons,
    });

    await menuItem.save();

    // بعد الحفظ رجّعه لنفس الصفحة مع رسالة بسيطة
    res.render("menu-new", {
      title: "Add New Menu Item",
      success: "Menu item saved successfully ✅",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving menu item");
  }
});

module.exports = router;
