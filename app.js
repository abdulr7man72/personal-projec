const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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


const invoiceallRoutes = require("./routes/invoiceall");
app.use("/", invoiceallRoutes);

app.use('/', require('./routes/receipts'));  // <-- هنا
const menuRoutes = require("./routes/menu");
app.use("/", menuRoutes);

const posRoutes = require("./routes/pos");
app.use("/", posRoutes);
app.use('/', require('./routes/purchases'));
app.get('/', (req,res)=> res.redirect('/invoice/bg01/stats'));



app.listen(3000, () => console.log('http://localhost:3000'));
