import Order from '../models/Order.js';
import User from '../models/User.js';
import Menu from '../models/Menu.js';
import { checkDeliveryRadius } from '../utils/haversine.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Public
 */
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      customerLocation,
      items,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId
    } = req.body;

    // Validation
    if (!customerName || !customerPhone || !deliveryAddress || !customerLocation || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate location
    const { lat, lng } = customerLocation;
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid location coordinates'
      });
    }

    // Check delivery radius
    const radiusCheck = checkDeliveryRadius(lat, lng);
    
    if (!radiusCheck.isWithinRadius) {
      return res.status(400).json({
        success: false,
        message: `Sorry, we only deliver within ${radiusCheck.maxRadius} km radius. Your location is ${radiusCheck.distance} km away.`,
        distance: radiusCheck.distance,
        maxRadius: radiusCheck.maxRadius
      });
    }

    // Check if user exists, if not create
    let user = await User.findOne({ phone: customerPhone });
    
    if (!user) {
      user = await User.create({
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress,
        location: { lat, lng }
      });
    }

    // Validate menu items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.itemId);
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${item.itemId} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // Create order
    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      customerLocation: { lat, lng },
      paymentMethod,
      paymentStatus: paymentMethod === 'Online' ? 'Completed' : 'Pending',
      razorpayOrderId,
      razorpayPaymentId,
      status: 'Pending'
    });

    // Populate order with user and item details
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name phone')
      .populate('items.itemId', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder,
      deliveryInfo: {
        distance: radiusCheck.distance,
        estimatedTime: '30-45 minutes'
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    // Build filter
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('userId', 'name phone address')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Public
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name phone address')
      .populate('items.itemId', 'name image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order status'
      });
    }

    const validStatuses = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (status === 'Rejected' && rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('userId', 'name phone')
      .populate('items.itemId', 'name');

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

/**
 * @desc    Get orders by phone number
 * @route   GET /api/orders/customer/:phone
 * @access  Public
 */
export const getCustomerOrders = async (req, res) => {
  try {
    const { phone } = req.params;

    // Find user by phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No orders found for this phone number'
      });
    }

    // Get user's orders
    const orders = await Order.find({ userId: user._id })
      .populate('items.itemId', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get Customer Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer orders'
    });
  }
};

/**
 * @desc    Get order statistics (for admin dashboard)
 * @route   GET /api/orders/stats/dashboard
 * @access  Private (Admin only)
 */
export const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const acceptedOrders = await Order.countDocuments({ status: 'Accepted' });
    const preparingOrders = await Order.countDocuments({ status: 'Preparing' });
    const outForDeliveryOrders = await Order.countDocuments({ status: 'Out for Delivery' });
    const deliveredToday = await Order.countDocuments({
      status: 'Delivered',
      createdAt: { $gte: today }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          status: { $ne: 'Rejected' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayOrders,
        pendingOrders,
        acceptedOrders,
        preparingOrders,
        outForDeliveryOrders,
        deliveredToday,
        todayRevenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0
      }
    });
  } catch (error) {
    console.error('Get Order Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};
