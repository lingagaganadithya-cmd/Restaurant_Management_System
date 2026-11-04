require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const Food = require('./models/Food');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentRoutes);

const sampleFoods = [
  { name: 'Paneer Tikka', description: 'Char-grilled cottage cheese cubes with smoky spices.', price: 220, category: 'Starters', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Veg Spring Roll', description: 'Crispy rolls filled with fresh vegetables and herbs.', price: 180, category: 'Starters', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Butter Chicken', description: 'Creamy, rich chicken curry served with naan or rice.', price: 360, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Paneer Butter Masala', description: 'Soft paneer in tomato, butter, and cashew gravy.', price: 310, category: 'Main Course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Chicken Dum Biryani', description: 'Layered biryani with aromatic basmati rice and tender chicken.', price: 420, category: 'Biryani', image: 'https://images.unsplash.com/photo-1633945274404-4b1d6f6e7d2a?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Veg Biryani', description: 'A fragrant vegetable biryani with warming spices.', price: 290, category: 'Biryani', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Classic Burger', description: 'Grilled patty with cheese, lettuce, and our signature sauce.', price: 240, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'French Fries', description: 'Crispy golden fries served hot and seasoned.', price: 120, category: 'Fast Food', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Chocolate Brownie', description: 'Warm, fudgy brownie with a rich chocolate finish.', price: 180, category: 'Desserts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', isAvailable: true },
  { name: 'Mango Shake', description: 'Refreshing mango shake blended with milk and ice cream.', price: 150, category: 'Beverages', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', isAvailable: true },
];

const seedFoods = async () => {
  const count = await Food.countDocuments();
  if (count === 0) {
    await Food.insertMany(sampleFoods);
    console.log('Sample restaurant food data inserted.');
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedFoods();
    app.listen(PORT, () => {
      console.log(`Restaurant API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
