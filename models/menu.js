const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  prices: {
    inStore: Number,
    goFood: Number,
    grabFood: Number,
    shopeeFood: Number
  },
  addons: [
    {
      name: String,
      prices: {
        inStore: Number,
        goFood: Number,
        grabFood: Number,
        shopeeFood: Number
      }
    }
  ],
  catagory: String,
  imageUrl: String
});

// إنشاء الموديل (collection)
const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
