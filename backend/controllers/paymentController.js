const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const PaymentAttempt = require('../models/PaymentAttempt');
const {
  buildOrderItems,
  createOrderForUser,
  OrderServiceError,
} = require('../services/orderService');

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error('Razorpay is not configured. Add the Razorpay keys to backend/.env.');
    error.statusCode = 503;
    throw error;
  }

  return {
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keyId,
    keySecret,
  };
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { items, customerName, customerPhone, deliveryAddress } = req.body;
    if (!customerName || !customerPhone || !deliveryAddress) {
      return res.status(400).json({ message: 'Customer details are required.' });
    }

    const { orderItems, totalAmount } = await buildOrderItems(items);
    const amountPaise = Math.round(totalAmount * 100);
    if (amountPaise < 100) {
      return res.status(400).json({ message: 'The order total must be at least ₹1 for UPI payment.' });
    }

    const { client, keyId } = getRazorpayClient();
    const gatewayOrder = await client.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rst_${Date.now()}_${req.user._id.toString().slice(-6)}`,
      notes: { userId: req.user._id.toString() },
    });

    await PaymentAttempt.create({
      user: req.user._id,
      razorpayOrderId: gatewayOrder.id,
      items: orderItems,
      customerName,
      customerPhone,
      deliveryAddress,
      totalAmount,
      amountPaise,
    });

    return res.status(201).json({
      keyId,
      orderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(error.statusCode || 502).json({
      message: error.statusCode ? error.message : 'Unable to start UPI payment.',
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  let claimedAttempt;
  try {
    const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: signature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return res.status(400).json({ message: 'Razorpay payment details are incomplete.' });
    }

    const attempt = await PaymentAttempt.findOne({
      razorpayOrderId,
      user: req.user._id,
    });
    if (!attempt) {
      return res.status(404).json({ message: 'Payment attempt not found.' });
    }

    if (attempt.status === 'paid') {
      const existingOrder = await Order.findById(attempt.order);
      if (!existingOrder) {
        return res.status(500).json({ message: 'Payment was verified, but its order record is unavailable.' });
      }
      return res.json({ message: 'Payment already verified.', order: existingOrder });
    }

    const { client, keySecret } = getRazorpayClient();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = /^[a-f0-9]{64}$/i.test(signature) ? Buffer.from(signature, 'hex') : Buffer.alloc(0);

    if (receivedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    const payment = await client.payments.fetch(razorpayPaymentId);
    if (
      payment.order_id !== attempt.razorpayOrderId
      || payment.amount !== attempt.amountPaise
      || payment.currency !== 'INR'
      || payment.status !== 'captured'
    ) {
      return res.status(400).json({ message: 'The UPI payment is not captured or does not match this order.' });
    }

    claimedAttempt = await PaymentAttempt.findOneAndUpdate(
      { _id: attempt._id, status: 'pending' },
      { $set: { status: 'processing', razorpayPaymentId } },
      { new: true }
    );

    if (!claimedAttempt) {
      const existingOrder = await Order.findOne({ paymentId: razorpayPaymentId });
      if (existingOrder) {
        return res.json({ message: 'Payment already verified.', order: existingOrder });
      }
      return res.status(409).json({ message: 'This payment is already being verified. Please refresh your orders shortly.' });
    }

    const order = await createOrderForUser({
      userId: req.user._id,
      orderItems: attempt.items,
      totalAmount: attempt.totalAmount,
      customerName: attempt.customerName,
      customerPhone: attempt.customerPhone,
      deliveryAddress: attempt.deliveryAddress,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      paymentId: razorpayPaymentId,
    });

    await PaymentAttempt.findByIdAndUpdate(claimedAttempt._id, {
      $set: { status: 'paid', order: order._id },
    });

    return res.status(201).json({ message: 'UPI payment verified and order placed.', order });
  } catch (error) {
    if (claimedAttempt) {
      const existingOrder = await Order.findOne({ paymentId: claimedAttempt.razorpayPaymentId });
      if (existingOrder) {
        return res.json({ message: 'Payment already verified.', order: existingOrder });
      }
      await PaymentAttempt.findByIdAndUpdate(claimedAttempt._id, {
        $set: { status: 'pending' },
        $unset: { razorpayPaymentId: 1 },
      });
    }

    if (error instanceof OrderServiceError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(error.statusCode || 502).json({
      message: error.statusCode ? error.message : 'Unable to verify UPI payment.',
    });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
