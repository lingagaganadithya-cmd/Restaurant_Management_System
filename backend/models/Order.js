const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    paymentMethod: { type: String, enum: ['Cash on Delivery', 'UPI'], default: 'Cash on Delivery' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    paymentId: { type: String, unique: true, sparse: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
