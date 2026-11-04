import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [foods, setFoods] = useState([]);
  const [foodForm, setFoodForm] = useState({ name: '', description: '', category: 'Starters', price: '', image: '', isAvailable: true });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      const [dashboardResponse, foodsResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/food'),
      ]);
      setStats(dashboardResponse.data);
      setFoods(foodsResponse.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/food', { ...foodForm, price: Number(foodForm.price) });
      setMessage('Food item added successfully.');
      setFoodForm({ name: '', description: '', category: 'Starters', price: '', image: '', isAvailable: true });
      await fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to add food item.');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      await fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to update order status.');
    }
  };

  const deleteFood = async (foodId, foodName) => {
    if (!window.confirm(`Delete "${foodName}" from the menu?`)) {
      return;
    }

    setError('');
    setMessage('');
    try {
      await api.delete(`/food/${foodId}`);
      setMessage('Food item deleted successfully.');
      await fetchDashboard();
    } catch (error) {
      setError(error.response?.data?.message || 'Unable to delete food item.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFoodForm({ ...foodForm, [name]: type === 'checkbox' ? checked : value });
  };

  if (!stats) {
    return <div className="container section-spacing loading-box">Loading admin dashboard...</div>;
  }

  return (
    <div className="container section-spacing admin-dashboard">
      <div className="section-header">
        <span className="eyebrow">Admin Panel</span>
        <h2>Restaurant Dashboard</h2>
      </div>

      {message && <div className="success-box">{message}</div>}
      {error && <div className="error-box">{error}</div>}

      <div className="row g-4 stats-grid">
        <div className="col-md-3"><div className="stat-card"><span>Total Users</span><h3>{stats.userCount}</h3></div></div>
        <div className="col-md-3"><div className="stat-card"><span>Total Food Items</span><h3>{stats.foodCount}</h3></div></div>
        <div className="col-md-3"><div className="stat-card"><span>Total Orders</span><h3>{stats.orderCount}</h3></div></div>
        <div className="col-md-3"><div className="stat-card"><span>Total Sales</span><h3>₹{stats.totalSales}</h3></div></div>
      </div>

      <div className="admin-panels row g-4 mt-1">
        <div className="col-lg-5">
          <div className="panel-card">
            <h3>Add new food item</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Food name" value={foodForm.name} onChange={handleChange} required />
              <textarea name="description" placeholder="Description" rows="3" value={foodForm.description} onChange={handleChange} required />
              <div className="row g-2">
                <div className="col-6">
                  <select name="category" value={foodForm.category} onChange={handleChange}>
                    <option>Starters</option>
                    <option>Main Course</option>
                    <option>Biryani</option>
                    <option>Fast Food</option>
                    <option>Desserts</option>
                    <option>Beverages</option>
                  </select>
                </div>
                <div className="col-6">
                  <input type="number" name="price" placeholder="Price" value={foodForm.price} onChange={handleChange} required />
                </div>
              </div>
              <input type="url" name="image" placeholder="Image URL" value={foodForm.image} onChange={handleChange} required />
              <label className="checkbox-row"><input type="checkbox" name="isAvailable" checked={foodForm.isAvailable} onChange={handleChange} /> Available</label>
              <button className="primary-btn" type="submit">Add Food</button>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="panel-card food-management-panel">
            <h3>Manage food items</h3>
            {foods.length === 0 ? (
              <p>No food items are available.</p>
            ) : (
              <div className="food-management-list">
                {foods.map((food) => (
                  <div className="food-management-row" key={food._id}>
                    <div>
                      <strong>{food.name}</strong>
                      <p>{food.category} · ₹{food.price}</p>
                    </div>
                    <button className="danger-btn" type="button" onClick={() => deleteFood(food._id, food.name)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel-card">
            <h3>Recent orders</h3>
            {stats.recentOrders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <div className="order-table">
                {stats.recentOrders.map((order) => (
                  <div className="order-row" key={order._id}>
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{order.customerName}</p>
                    </div>
                    <div>
                      <span>₹{order.totalAmount}</span>
                      <p>{order.paymentMethod} · {order.paymentStatus}</p>
                    </div>
                    <div>
                      <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                        <option>Pending</option>
                        <option>Confirmed</option>
                        <option>Preparing</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
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

export default AdminDashboard;
