const jwt = require('jsonwebtoken');

// إنشاء JWT Token
const generateToken = (userId, branchCode) => {
  return jwt.sign(
    { userId, branchCode },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: '7d' }
  );
};

// التحقق من Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
  } catch (error) {
    return null;
  }
};

// Middleware للتحقق من المصادقة
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.redirect('/login');
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.redirect('/login');
  }
  
  req.user = decoded;
  req.branch = decoded.branchCode;
  next();
};

// Middleware لتعيين الفرع من الـ URL أو الجلسة
const branchFromUrl = (req, res, next) => {
  const { branch } = req.params;
  if (branch) {
    req.branch = branch;
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  branchFromUrl
};
