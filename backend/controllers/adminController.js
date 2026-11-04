const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');

const getDashboardStats = async (req, res) => {
  try {
    const [userCount, foodCount, orderCount, totalSales] = await Promise.all([
      User.countDocuments(),
      Food.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);

    const salesTotal = totalSales[0]?.total || 0;
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');

    return res.json({
      userCount,
      foodCount,
      orderCount,
      totalSales: salesTotal,
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load dashboard.', error: error.message });
  }
};

module.exports = { getDashboardStats };
