const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Branch = require('../models/Branch');
const { generateToken, authMiddleware } = require('../middleware/auth');
const cookieParser = require('cookie-parser');

// GET صفحة تسجيل الدخول
router.get('/login', (req, res) => {
  const error = req.query.error || null;
  res.render('login', { 
    error,
    title: 'Masuk ke Sistem' 
  });
});

// POST تسجيل الدخول
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // تحقق من وجود المستخدم
    const user = await User.findOne({ username }).populate('branch');
    
    if (!user) {
      return res.status(401).render('login', { 
        error: 'Username atau password salah',
        title: 'Masuk ke Sistem'
      });
    }

    // تحقق من حالة المستخدم
    if (user.status !== 'active') {
      return res.status(403).render('login', { 
        error: 'Akun pengguna telah dinonaktifkan',
        title: 'Masuk ke Sistem'
      });
    }

    // تحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).render('login', { 
        error: 'Username atau password salah',
        title: 'Masuk ke Sistem'
      });
    }

    // حدّث وقت آخر دخول
    user.lastLogin = new Date();
    await user.save();

    // إنشاء JWT token
    const token = generateToken(user._id, user.branchCode);

    // احفظ الـ token في الكوكي
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // احفظ بيانات المستخدم في الجلسة
    if (req.session) {
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.fullName = user.fullName;
      req.session.branch = user.branchCode;
      req.session.role = user.role;
    }

    // أعد التوجيه إلى الصفحة الرئيسية للفرع
    const branchCode = user.branchCode.toLowerCase();
    res.redirect(`/invoice/${branchCode}/stats`);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', { 
      error: 'Terjadi kesalahan di server',
      title: 'Masuk ke Sistem'
    });
  }
});

// POST تسجيل الدخول للمسؤول
router.post('/ALL/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // تحقق من وجود المستخدم
    const user = await User.findOne({ username }).populate('branch');
    
    if (!user) {
      return res.status(401).render('login', { 
        error: 'Username atau password salah',
        title: 'Masuk - Admin Pusat',
        branch: 'ALL'
      });
    }

    // التحقق من أن المستخدم هو admin فقط
    if (user.role !== 'admin') {
      return res.status(403).render('login', { 
        error: 'Akses ditolak. Hanya admin yang dapat masuk di sini.',
        title: 'Masuk - Admin Pusat',
        branch: 'ALL'
      });
    }

    // تحقق من حالة المستخدم
    if (user.status !== 'active') {
      return res.status(403).render('login', { 
        error: 'Akun pengguna telah dinonaktifkan',
        title: 'Masuk - Admin Pusat',
        branch: 'ALL'
      });
    }

    // تحقق من كلمة المرور
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).render('login', { 
        error: 'Username atau password salah',
        title: 'Masuk - Admin Pusat',
        branch: 'ALL'
      });
    }

    // حدّث وقت آخر دخول
    user.lastLogin = new Date();
    await user.save();

    // إنشاء JWT token
    const token = generateToken(user._id, user.branchCode);

    // احفظ الـ token في الكوكي
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // احفظ بيانات المستخدم في الجلسة
    if (req.session) {
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.fullName = user.fullName;
      req.session.branch = user.branchCode;
      req.session.role = user.role;
    }

    // أعد التوجيه إلى الصفحة الرئيسية للفرع
    res.redirect(`/invoice/all/stats`);

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).render('login', { 
      error: 'Terjadi kesalahan di server',
      title: 'Masuk - Admin Pusat',
      branch: 'ALL'
    });
  }
});

// GET صفحة تسجيل مستخدم جديد (للإداريين فقط)
router.get('/register', authMiddleware, async (req, res) => {
  try {
    // تحقق من أن المستخدم admin
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).send('Akses ditolak');
    }

    const branches = await Branch.find({ active: true });
    res.render('register', { 
      branches,
      title: 'Daftar Pengguna Baru'
    });
  } catch (error) {
    console.error('Register page error:', error);
    res.redirect('/login?error=Terjadi_kesalahan');
  }
});

// POST تسجيل مستخدم جديد
router.post('/register', authMiddleware, async (req, res) => {
  try {
    // تحقق من أن المستخدم admin
    const currentUser = await User.findById(req.user.userId);
    if (currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    const { username, email, password, confirmPassword, fullName, branch, role } = req.body;

    // تحقق من صحة البيانات
    if (!username || !email || !password || !fullName || !branch) {
      return res.render('register', { 
        error: 'Semua bidang wajib diisi',
        branches: await Branch.find({ active: true }),
        title: 'Daftar Pengguna Baru'
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', { 
        error: 'Password tidak cocok',
        branches: await Branch.find({ active: true }),
        title: 'Daftar Pengguna Baru'
      });
    }

    // تحقق من عدم وجود المستخدم
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.render('register', { 
        error: 'Username atau email sudah terdaftar',
        branches: await Branch.find({ active: true }),
        title: 'Daftar Pengguna Baru'
      });
    }

    // تحقق من وجود الفرع
    const branchDoc = await Branch.findById(branch);
    if (!branchDoc) {
      return res.render('register', { 
        error: 'Cabang tidak ditemukan',
        branches: await Branch.find({ active: true }),
        title: 'Daftar Pengguna Baru'
      });
    }

    // إنشاء مستخدم جديد
    const newUser = new User({
      username,
      email,
      password,
      fullName,
      branch: branchDoc._id,
      branchCode: branchDoc.code,
      role: role || 'cashier'
    });

    await newUser.save();

    res.json({ 
      success: true,
      message: 'Pengguna berhasil didaftarkan',
      user: {
        username: newUser.username,
        fullName: newUser.fullName,
        branch: newUser.branchCode
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan di server' });
  }
});

// تسجيل الخروج
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('session');
  res.redirect('/login');
});

module.exports = router;
