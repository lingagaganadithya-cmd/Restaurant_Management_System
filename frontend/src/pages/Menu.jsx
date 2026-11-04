import { useEffect, useState } from 'react';
import FoodCard from '../components/FoodCard';
import api from '../services/api';

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food', { params: { category, search, sort } });
      setFoods(res.data);
    } catch (error) {
      console.error('Unable to load menu', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [category, search, sort]);

  const addToCart = (food) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemExists = existingCart.find((item) => item.foodId === food._id);

    if (itemExists) {
      itemExists.quantity += 1;
    } else {
      existingCart.push({ foodId: food._id, name: food.name, price: food.price, image: food.image, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    alert(`${food.name} added to cart.`);
  };

  return (
    <div className="container section-spacing">
      <div className="section-header">
        <span className="eyebrow">Our Delicious Menu</span>
        <h2>Discover Your Favorite</h2>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search food by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Starters">Starters</option>
          <option value="Main Course">Main Course</option>
          <option value="Biryani">Biryani</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Desserts">Desserts</option>
          <option value="Beverages">Beverages</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-box">Loading menu...</div>
      ) : foods.length === 0 ? (
        <div className="empty-box">No food items match your search.</div>
      ) : (
        <div className="row g-4">
          {foods.map((food) => (
            <div key={food._id} className="col-md-6 col-lg-4">
              <FoodCard food={food} onAddToCart={addToCart} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
