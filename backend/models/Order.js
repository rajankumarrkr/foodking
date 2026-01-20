import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Menu',
          required: true
        },
        name: String, // Store name for order history
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    customerLocation: {
      lat: Number,
      lng: Number
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Rejected'],
      default: 'Pending'
    },
    rejectionReason: String
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
