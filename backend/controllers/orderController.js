const Order = require('../models/Order');
const { buildOrderItems, createOrderForUser, OrderServiceError } = require('../services/orderService');

const createOrder = async (req, res) => {
  try {
    const { items, customerName, customerPhone, deliveryAddress, paymentMethod } = req.body;

    if (paymentMethod && paymentMethod !== 'Cash on Delivery') {
      return res.status(400).json({ message: 'Online payments must be completed through checkout.' });
    }

    const { orderItems, totalAmount } = await buildOrderItems(items);
    const order = await createOrderForUser({
      userId: req.user._id,
      orderItems,
      totalAmount,
      customerName,
      customerPhone,
      deliveryAddress,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    return res.status(201).json({ message: 'Order placed successfully.', order: populatedOrder });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Unable to place order.', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch your orders.', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view this order.' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch order details.', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch all orders.', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update order status.', error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
