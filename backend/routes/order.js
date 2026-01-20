import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getCustomerOrders,
  getOrderStats
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (Admin only) - More specific routes first
router.get('/stats/dashboard', protect, getOrderStats);
router.get('/', protect, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);

// Public routes
router.post('/', createOrder);
router.get('/customer/:phone', getCustomerOrders);
router.get('/:id', getOrderById);

export default router;
