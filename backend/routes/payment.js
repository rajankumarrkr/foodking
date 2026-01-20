import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey
} from '../controllers/paymentController.js';

const router = express.Router();

// Public routes
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/key', getRazorpayKey);

export default router;
