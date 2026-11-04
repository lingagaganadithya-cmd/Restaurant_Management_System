import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [popularFoods, setPopularFoods] = useState([]);

  useEffect(() => {
    const fetchPopularFoods = async () => {
      try {
        const res = await api.get('/food');
        setPopularFoods(res.data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch menu', error);
      }
    };

    fetchPopularFoods();
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow">Fresh • Fast • Delicious</span>
            <h1>FlavorNest Kitchen</h1>
            <p>Enjoy handcrafted meals, healthy bowls, and chef-special platters delivered right to your doorstep.</p>
            <div className="d-flex gap-3 flex-wrap">
              <Link className="primary-btn" to="/menu">Explore Menu</Link>
              <Link className="secondary-btn" to="/cart">Order Now</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-spacing">
        <div className="section-header">
          <span className="eyebrow">Popular Dishes</span>
          <h2>Chef’s Favorites</h2>
        </div>

        <div className="row g-4">
          {popularFoods.map((food) => (
            <div className="col-md-6 col-lg-3" key={food._id}>
              <div className="food-card home-card">
                <img src={food.image} alt={food.name} className="food-image" />
                <div className="food-body">
                  <h4>{food.name}</h4>
                  <p>{food.description}</p>
                  <div className="food-meta-row">
                    <span className="food-category">{food.category}</span>
                    <strong>₹{food.price}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section-spacing">
        <div className="section-header">
          <span className="eyebrow">Our Specialties</span>
          <h2>Signature Taste</h2>
        </div>
        <div className="row g-4 specialties-row">
          <div className="col-md-4">
            <div className="info-card">
              <i className="bi bi-stars" />
              <h4>Chef Special</h4>
              <p>Curated lunch and dinner menu crafted with authentic spices and premium ingredients.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="info-card">
              <i className="bi bi-bag-heart" />
              <h4>Healthy Choices</h4>
              <p>Balanced meals for wellness-driven and calorie-conscious customers.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="info-card">
              <i className="bi bi-clock-history" />
              <h4>Fast Delivery</h4>
              <p>Hot and fresh meals delivered in record time across the city.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-spacing">
        <div className="section-header">
          <span className="eyebrow">Why Us</span>
          <h2>Reasons Guests Return</h2>
        </div>
        <div className="row g-4">
          <div className="col-md-3"><div className="feature-box"><i className="bi bi-award" /><p>Top-rated food quality</p></div></div>
          <div className="col-md-3"><div className="feature-box"><i className="bi bi-truck" /><p>Fast delivery support</p></div></div>
          <div className="col-md-3"><div className="feature-box"><i className="bi bi-shield-check" /><p>Safe and hygienic kitchen</p></div></div>
          <div className="col-md-3"><div className="feature-box"><i className="bi bi-emoji-smile" /><p>Friendly service</p></div></div>
        </div>
      </section>

      <section className="container section-spacing">
        <div className="section-header">
          <span className="eyebrow">Testimonials</span>
          <h2>What Customers Say</h2>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="testimonial-card">
              <p>“The food arrived fresh and delicious. The biryani was my favorite.”</p>
              <strong>— Priya</strong>
            </div>
          </div>
          <div className="col-md-4">
            <div className="testimonial-card">
              <p>“Excellent service and super quick delivery. Highly recommended.”</p>
              <strong>— Arjun</strong>
            </div>
          </div>
          <div className="col-md-4">
            <div className="testimonial-card">
              <p>“The best place for family meals and quick comfort food.”</p>
              <strong>— Sneha</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
