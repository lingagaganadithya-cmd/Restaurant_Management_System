const mongoose = require('mongoose');

const paymentItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const paymentAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    items: { type: [paymentItemSchema], required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    amountPaise: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'paid'], default: 'pending' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);
