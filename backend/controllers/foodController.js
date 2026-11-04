const Food = require('../models/Food');

const getFoods = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let foods = await Food.find(query).sort({ createdAt: -1 });

    if (sort === 'low-high') {
      foods = [...foods].sort((a, b) => a.price - b.price);
    } else if (sort === 'high-low') {
      foods = [...foods].sort((a, b) => b.price - a.price);
    }

    return res.json(foods);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch menu items.', error: error.message });
  }
};

const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found.' });
    }

    return res.json(food);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch food item.', error: error.message });
  }
};

const createFood = async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: 'Please fill all food details.' });
    }

    const food = await Food.create({
      name,
      description,
      price,
      category,
      image,
      isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,
    });

    return res.status(201).json({ message: 'Food item added successfully.', food });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to add food item.', error: error.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!food) {
      return res.status(404).json({ message: 'Food item not found.' });
    }

    return res.json({ message: 'Food item updated successfully.', food });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update food item.', error: error.message });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found.' });
    }

    return res.json({ message: 'Food item deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete food item.', error: error.message });
  }
};

module.exports = { getFoods, getFoodById, createFood, updateFood, deleteFood };
