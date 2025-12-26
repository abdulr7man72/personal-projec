const mongoose = require('mongoose');
const path = require('path');
const Branch = require(path.join(__dirname, '..', 'models', 'Branch'));
const User = require(path.join(__dirname, '..', 'models', 'User'));

// البيانات الاتصالية
const MONGO_URL = 'mongodb+srv://apslun:abdoolfree1@cluster0.vo1kj74.mongodb.net/tpos?retryWrites=true&w=majority';

// بيانات الفروع الافتراضية
const defaultBranches = [
  {
    code: 'ALL',
    name: 'Pusat - Semua Cabang',
    address: 'Jakarta - Pusat',
    phone: '021-12345678',
    manager: 'Admin Pusat'
  },
  {
    code: 'BGR01',
    name: 'Cabang Bumi Raya - Medan',
    address: 'Medan - Jl. Bumi Raya',
    phone: '061-4444555',
    manager: 'Manajer BGR01'
  },
  {
    code: 'SPL01',
    name: 'Cabang Superlogi - Surabaya',
    address: 'Surabaya - Jl. Superlogi',
    phone: '031-3333666',
    manager: 'Manajer SPL01'
  }
];

// بيانات المستخدمين الافتراضيين
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@pos.com',
    password: 'admin123',
    fullName: 'Admin Pusat',
    branchCode: 'ALL',
    role: 'admin'
  },
  {
    username: 'manajer_bgr01',
    email: 'manager@bgr01.com',
    password: 'manager123',
    fullName: 'Manajer BGR01',
    branchCode: 'BGR01',
    role: 'manager'
  },
  {
    username: 'kasir1_bgr01',
    email: 'kasir1@bgr01.com',
    password: 'kasir123',
    fullName: 'Kasir 1 - BGR01',
    branchCode: 'BGR01',
    role: 'cashier'
  },
  {
    username: 'kasir1_spl01',
    email: 'kasir1@spl01.com',
    password: 'kasir123',
    fullName: 'Kasir 1 - SPL01',
    branchCode: 'SPL01',
    role: 'cashier'
  }
];

async function seedDatabase() {
  try {
    // الاتصال بـ MongoDB
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Database connected');

    // حذف البيانات القديمة (اختياري)
    // const clearAll = process.argv[2] === '--clear';
    // if (clearAll) {
    //   await Branch.deleteMany({});
    //   await User.deleteMany({});
    //   console.log('🗑️ Database cleared');
    // }

    // إضافة الفروع
    console.log('\n📍 Adding branches...');
    const branches = [];
    
    for (const branchData of defaultBranches) {
      const existingBranch = await Branch.findOne({ code: branchData.code });
      
      if (!existingBranch) {
        const branch = new Branch(branchData);
        await branch.save();
        branches.push(branch);
        console.log(`   ✓ Created: ${branch.code} - ${branch.name}`);
      } else {
        branches.push(existingBranch);
        console.log(`   • Already exists: ${existingBranch.code}`);
      }
    }

    // إضافة المستخدمين
    console.log('\n👤 Adding users...');
    
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      
      if (!existingUser) {
        // ابحث عن الفرع
        const branch = await Branch.findOne({ code: userData.branchCode });
        
        if (branch) {
          const user = new User({
            ...userData,
            branch: branch._id
          });
          await user.save();
          console.log(`   ✓ Created: ${user.username} (${user.role}) - ${user.branchCode}`);
        } else {
          console.log(`   ✗ Branch not found for: ${userData.username}`);
        }
      } else {
        console.log(`   • Already exists: ${existingUser.username}`);
      }
    }

    console.log('\n✅ Database seeding completed!\n');
    
    // طباعة معلومات تسجيل الدخول
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Test Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    defaultUsers.forEach(user => {
      console.log(`\n👤 ${user.fullName}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Branch: ${user.branchCode}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
seedDatabase();
