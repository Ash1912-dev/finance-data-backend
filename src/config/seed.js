const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Role = require('../modules/roles/role.model');
const User = require('../modules/users/user.model');
const { SEED_ROLES } = require('./constants');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_db';

const seed = async () => {
  try {
    console.error('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // upsert default roles
    for (const role of SEED_ROLES) {
      const result = await Role.findOneAndUpdate(
        { slug: role.slug },
        { $setOnInsert: role },
        { upsert: true, new: true }
      );
      console.error(`  Role: ${result.name} (${result.slug})`);
    }

    // create test admin if it doesn't exist
    const adminRole = await Role.findOne({ slug: 'admin' });
    if (adminRole) {
      const exists = await User.findOne({ email: 'admin@finance.app' });
      if (!exists) {
        await User.create({
          name: 'System Admin',
          email: 'admin@finance.app',
          passwordHash: await bcrypt.hash('Admin@1234', 12),
          role: adminRole._id,
          status: 'active',
        });
        console.error('  Admin created → admin@finance.app / Admin@1234');
      } else {
        console.error('  Admin already exists');
      }
    }

    console.error('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
