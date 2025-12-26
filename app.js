const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

// محاولة تحميل المكتبات الاختيارية
let cookieParser, session;
try {
  cookieParser = require('cookie-parser');
} catch (e) {
  console.warn('⚠️ cookie-parser not installed, skipping...');
  cookieParser = null;
}

try {
  session = require('express-session');
} catch (e) {
  console.warn('⚠️ express-session not installed, skipping...');
  session = null;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// استخدام cookie-parser إذا كان متوفر
if (cookieParser) {
  app.use(cookieParser());
}

// استخدم جلسة المستخدم إذا كانت متوفرة
if (session) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// PWA - Manifest.json middleware
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Service Worker
app.get('/service-worker.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.set("io", io);

mongoose.connect('mongodb+srv://apslun:abdoolfree1@cluster0.vo1kj74.mongodb.net/tpos?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error(err));

// محاولة تحميل routes للمصادقة
try {
  const authRoutes = require("./routes/auth");
  app.use("/", authRoutes);
  console.log('✅ Auth routes loaded');
} catch (e) {
  console.warn('⚠️ Auth routes error:', e.message);
}

const invoiceallRoutes = require("./routes/invoiceall");
app.use("/", invoiceallRoutes);

app.use('/', require('./routes/receipts'));
const menuRoutes = require("./routes/menu");
app.use("/", menuRoutes);

const posRoutes = require("./routes/pos");
app.use("/", posRoutes);
app.use('/', require('./routes/purchases'));

// صفحة رئيسية
app.get('/', (req, res) => {
  res.redirect('/login');
});

server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  if (!session) {
    console.log('\n⚠️ Missing dependencies! To enable login system, run:');
    console.log('   npm install bcryptjs cookie-parser express-session jsonwebtoken\n');
  }
});
