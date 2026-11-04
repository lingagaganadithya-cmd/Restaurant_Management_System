import { useEffect, useState } from 'react';
import api from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/myorders');
        setOrders(res.data);
      } catch (error) {
        console.error('Unable to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="container section-spacing loading-box">Loading your orders...</div>;
  }

  return (
    <div className="container section-spacing">
      <div className="section-header">
        <span className="eyebrow">Order History</span>
        <h2>My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-box">You have not placed any order yet.</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header-row">
                <div>
                  <h4>{order.orderNumber}</h4>
                  <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <span className="status-badge">{order.status}</span>
              </div>

              <div className="order-details-grid">
                <div>
                  <strong>Items</strong>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>{item.name} x {item.quantity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Address</strong>
                  <p>{order.deliveryAddress}</p>
                </div>
                <div>
                  <strong>Total</strong>
                  <p>₹{order.totalAmount}</p>
                  <p>{order.paymentMethod} · {order.paymentStatus}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
