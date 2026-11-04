import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', deliveryAddress: '' });
  const [error, setError] = useState('');
  const [savedDetails, setSavedDetails] = useState(null);
  const [useSavedDetails, setUseSavedDetails] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    if (localStorage.getItem('token')) {
      api.get('/auth/profile')
        .then((response) => {
          setSavedDetails(response.data);
          setForm({
            customerName: response.data.name || '',
            customerPhone: response.data.phone || '',
            deliveryAddress: response.data.address || '',
          });
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Unable to load your saved delivery details.');
        });
    }
  }, []);

  const updateQty = (foodId, direction) => {
    const updated = cartItems.map((item) => {
      if (item.foodId === foodId) {
        const newQty = Math.max(1, item.quantity + direction);
        return { ...item, quantity: newQty };
      }
      return item;
    });

    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (foodId) => {
    const updated = cartItems.filter((item) => item.foodId !== foodId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSavedDetailsChange = (e) => {
    const checked = e.target.checked;
    setUseSavedDetails(checked);
    if (checked && savedDetails) {
      setForm({
        customerName: savedDetails.name || '',
        customerPhone: savedDetails.phone || '',
        deliveryAddress: savedDetails.address || '',
      });
    } else {
      setForm({ customerName: '', customerPhone: '', deliveryAddress: '' });
    }
  };

  const handleCheckout = async () => {
    setError('');
    if (!cartItems.length) {
      setError('Your cart is empty.');
      return;
    }

    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      setError('Please fill all delivery details.');
      return;
    }

    try {
      if (!localStorage.getItem('token')) {
        navigate('/login');
        return;
      }

      const payload = {
        items: cartItems.map((item) => ({ foodId: item.foodId, quantity: item.quantity })),
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deliveryAddress: form.deliveryAddress,
      };

      setIsSubmitting(true);
      if (paymentMethod === 'Cash on Delivery') {
        const response = await api.post('/orders', { ...payload, paymentMethod });
        completeOrder(response.data.order);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout. Check your internet connection and try again.');
      }

      const { data: razorpayOrder } = await api.post('/payments/razorpay/order', payload);
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: razorpayOrder.keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'FlavorNest',
          description: 'Restaurant order',
          order_id: razorpayOrder.orderId,
          prefill: {
            name: form.customerName,
            contact: form.customerPhone,
          },
          method: { upi: true },
          handler: async (paymentResponse) => {
            try {
              const verification = await api.post('/payments/razorpay/verify', paymentResponse);
              completeOrder(verification.data.order);
              resolve();
            } catch (verificationError) {
              reject(new Error(verificationError.response?.data?.message || 'Unable to verify your UPI payment.'));
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment was cancelled. No order has been placed.')),
          },
          theme: { color: '#ed6a2c' },
        });

        checkout.on('payment.failed', (event) => {
          reject(new Error(event.error?.description || 'UPI payment failed.'));
        });
        checkout.open();
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOrder = (order) => {
    localStorage.removeItem('cart');
    setCartItems([]);
    alert('Order placed successfully! Your order number is ' + order.orderNumber);
    navigate('/my-orders');
  };

  return (
    <div className='container section-spacing cart-page'>
      <div className='section-header'>
        <span className='eyebrow'>Your Cart</span>
        <h2>Review and Checkout</h2>
      </div>

      {error && <div className='error-box'>{error}</div>}

      {cartItems.length === 0 ? (
        <div className='empty-box'>Your cart is empty. Start by adding items from the menu.</div>
      ) : (
        <div className='row g-4 align-items-start'>
          <div className='col-lg-8'>
            {cartItems.map((item) => (
              <div className='cart-item' key={item.foodId}>
                <img src={item.image} alt={item.name} />
                <div className='cart-item-details'>
                  <h4>{item.name}</h4>
                  <p>₹{item.price} each</p>
                  <div className='quantity-controls'>
                    <button onClick={() => updateQty(item.foodId, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.foodId, 1)}>+</button>
                  </div>
                </div>
                <button className='remove-btn' onClick={() => removeItem(item.foodId)}>Remove</button>
              </div>
            ))}
          </div>

          <div className='col-lg-4'>
            <div className='checkout-card'>
              <h3>Checkout</h3>
              {savedDetails && (
                <label className="saved-details-toggle">
                  <input type="checkbox" checked={useSavedDetails} onChange={handleSavedDetailsChange} />
                  Use my saved details
                </label>
              )}
              <input type='text' name='customerName' placeholder='Customer name' value={form.customerName} onChange={handleChange} />
              <input type='tel' name='customerPhone' placeholder='Phone number' value={form.customerPhone} onChange={handleChange} />
              <textarea name='deliveryAddress' placeholder='Delivery address' value={form.deliveryAddress} onChange={handleChange} rows='4' />
              <fieldset className="payment-options">
                <legend>Payment method</legend>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Pay online with UPI
                </label>
              </fieldset>
              <div className='summary-row'><span>Subtotal</span><strong>₹{subtotal}</strong></div>
              <div className='summary-row'><span>Delivery</span><strong>₹0</strong></div>
              <div className='summary-row total'><span>Total</span><strong>₹{subtotal}</strong></div>
              <button className='primary-btn full-width' onClick={handleCheckout} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : paymentMethod === 'UPI' ? 'Pay with UPI' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
