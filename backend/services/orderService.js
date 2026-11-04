const mongoose = require('mongoose');
const Food = require('../models/Food');
const Order = require('../models/Order');
const User = require('../models/User');

class OrderServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const buildOrderItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderServiceError('Your cart is empty.', 400);
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      throw new OrderServiceError('Invalid food item or quantity.', 400);
    }

    const foodId = item.foodId || item._id;
    const quantity = Number(item.quantity === undefined ? 1 : item.quantity);
    if (!mongoose.isValidObjectId(foodId) || !Number.isInteger(quantity) || quantity < 1) {
      throw new OrderServiceError('Invalid food item or quantity.', 400);
    }

    const food = await Food.findById(foodId);
    if (!food) {
      throw new OrderServiceError(`Food item not found: ${foodId}`, 404);
    }
    if (!food.isAvailable) {
      throw new OrderServiceError(`${food.name} is not available right now.`, 400);
    }

    const price = Number(food.price);
    orderItems.push({
      food: food._id,
      name: food.name,
      price,
      quantity,
      image: food.image,
    });
    totalAmount += price * quantity;
  }

  return { orderItems, totalAmount: Number(totalAmount.toFixed(2)) };
};

const createOrderForUser = async ({
  userId,
  orderItems,
  totalAmount,
  customerName,
  customerPhone,
  deliveryAddress,
  paymentMethod,
  paymentStatus,
  paymentId,
}) => {
  if (!customerName || !customerPhone || !deliveryAddress) {
    throw new OrderServiceError('Customer details are required.', 400);
  }

  const user = await User.findByIdAndUpdate(userId, {
    name: customerName,
    phone: customerPhone,
    address: deliveryAddress,
  }, { new: true, runValidators: true });

  if (!user) {
    throw new OrderServiceError('User not found.', 404);
  }

  const orderNumber = `RST-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
  return Order.create({
    user: userId,
    orderNumber,
    items: orderItems,
    customerName,
    customerPhone,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
    paymentId,
    totalAmount,
    status: 'Pending',
  });
};

module.exports = { buildOrderItems, createOrderForUser, OrderServiceError };
