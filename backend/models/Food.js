const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Starters', 'Main Course', 'Biryani', 'Fast Food', 'Desserts', 'Beverages'],
    },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
