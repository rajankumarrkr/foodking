import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import uploadRoutes from './routes/upload.js';





// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet()); // Adds security headers

// Rate Limiting (prevent abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 min
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FoodKing API is running! 🍔',
    restaurant: {
      name: 'FoodKing',
      location: {
        lat: process.env.RESTAURANT_LAT,
        lng: process.env.RESTAURANT_LNG
      },
      deliveryRadius: `${process.env.MAX_DELIVERY_RADIUS} km`
    }
  });
});

// Routes (we'll add these soon)
// app.use('/api/auth', authRoutes);
// app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);


// Error Handler Middleware (catch all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
