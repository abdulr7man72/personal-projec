// استدعاء مكتبة express
const express = require('express');
const path = require('path');

// إنشاء التطبيق
const app = express();

// تحديد المنفذ
const PORT = process.env.PORT || 3000;

// تعريف المجلد الذي يحتوي على ملفاتك الثابتة (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
