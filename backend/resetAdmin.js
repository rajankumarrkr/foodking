import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const reset = async () => {
    try {
        let admin = await Admin.findOne({ email: 'admin@foodking.com' });

        if (!admin) {
            admin = new Admin({
                name: 'FoodKing Admin',
                email: 'admin@foodking.com',
                password: 'Admin@123'
            });
            await admin.save();
            console.log('Admin created with password Admin@123');
        } else {
            admin.password = 'Admin@123';
            await admin.save();
            console.log('Admin password reset to Admin@123');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reset();
