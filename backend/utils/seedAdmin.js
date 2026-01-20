import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to database
connectDB();

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@foodking.com' });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      process.exit();
    }

    // Create default admin
    const admin = await Admin.create({
      name: 'FoodKing Admin',
      email: 'admin@foodking.com',
      password: 'Admin@123'
    });

    console.log('✅ Default admin created successfully!');
    console.log('📧 Email: admin@foodking.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  Please change password after first login in production!');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
