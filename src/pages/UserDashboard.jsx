import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const UserDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/orders/myorders'),
        ]);
        setProfile(profileResponse.data);
        setOrders(ordersResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="container section-spacing loading-box">Loading your dashboard...</div>;
  }

  const activeOrders = orders.filter((order) => order.status !== 'Cancelled');
  const totalSpent = activeOrders.reduce((total, order) => total + order.totalAmount, 0);

  return (
    <div className="container section-spacing user-dashboard">
      <div className="section-header">
        <span className="eyebrow">Your Account</span>
        <h2>Welcome{profile?.name ? `, ${profile.name}` : ''}</h2>
        <p>Manage your account and keep track of your restaurant orders.</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="row g-4 stats-grid">
        <div className="col-md-4">
          <div className="stat-card">
            <span>Total Orders</span>
            <h3>{orders.length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <span>Active Orders</span>
            <h3>{orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status)).length}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <span>Total Spent</span>
            <h3>₹{totalSpent.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      <div className="user-dashboard-panels row g-4 mt-1">
        <div className="col-lg-5">
          <div className="panel-card">
            <h3>Account details</h3>
            {profile ? (
              <div className="user-account-details">
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
                <p><strong>Delivery address:</strong> {profile.address || 'Not saved yet'}</p>
                <Link className="secondary-action" to="/profile">View profile</Link>
              </div>
            ) : (
              <p>Account details are not available.</p>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          <div className="panel-card">
            <div className="dashboard-panel-heading">
              <h3>Recent orders</h3>
              <Link to="/my-orders">View all</Link>
            </div>
            {orders.length === 0 ? (
              <div className="dashboard-empty">
                <p>You have not placed an order yet.</p>
                <Link className="primary-btn" to="/menu">Browse menu</Link>
              </div>
            ) : (
              <div className="order-table">
                {orders.slice(0, 5).map((order) => (
                  <div className="order-row user-order-row" key={order._id}>
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="status-badge">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
