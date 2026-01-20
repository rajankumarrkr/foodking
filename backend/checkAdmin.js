import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const check = async () => {
    try {
        const admin = await Admin.findOne({ email: 'admin@foodking.com' }).select('+password');
        if (admin) {
            console.log('Admin found:', admin.email);
        } else {
            console.log('Admin NOT found');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
