import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Function to get Razorpay instance (lazy initialization)
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Public
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid amount'
      });
    }

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise (₹1 = 100 paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        restaurant: 'FoodKing'
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating payment order'
    });
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payment/verify
 * @access  Public
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment details'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured');
    }

    // Create signature for verification
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    // Verify signature
    if (razorpay_signature === expectedSign) {
      // Update order payment status if orderId provided
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Completed',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      // Update order as failed if orderId provided
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Failed'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment'
    });
  }
};

/**
 * @desc    Get Razorpay key (for frontend)
 * @route   GET /api/payment/key
 * @access  Public
 */
export const getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay not configured'
      });
    }

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Get Razorpay Key Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment key'
    });
  }
};
