const Food = require('../models/Food');

const getRestaurantInfo = () => ({
  name: 'FlavorNest Kitchen',
  description: 'Fresh, delicious meals prepared daily with quality ingredients.',
  contact: '+91 98765 43210',
  email: 'hello@flavornest.com',
  openingHours: 'Mon-Sun: 9:00 AM - 11:00 PM',
  delivery: 'Free delivery for orders above ₹499',
});

const buildChatbotReply = async (message) => {
  const text = message ? message.trim() : '';
  const lower = text.toLowerCase();

  if (!text) {
    return { reply: 'Please write a message so I can help you.', quickReplies: ['Menu', 'Popular dishes', 'Opening hours'] };
  }

  if (/hello|hi|hey|good morning|good evening|good afternoon/.test(lower)) {
    return {
      reply: 'Hello! I am FlavorNest Kitchen assistant. I can help with the menu, food suggestions, cart guidance, and restaurant information.',
      quickReplies: ['Show menu', 'Recommend vegetarian food', 'Opening hours'],
    };
  }

  if (/(show|view).*(menu)|menu/.test(lower)) {
    const foods = await Food.find().limit(5).lean();
    const menuText = foods.length
      ? foods.map((food) => `- ${food.name} (${food.category}) - ₹${food.price}`).join('\n')
      : 'No menu items found yet.';

    return {
      reply: `Here are a few items from our menu:\n${menuText}\n\nYou can also filter by category on the menu page.`,
      quickReplies: ['Starters', 'Main Course', 'Biryani'],
    };
  }

  if (/(popular|top|recommended|suggest)/.test(lower)) {
    const foods = await Food.find({ isAvailable: true }).limit(4).lean();
    const items = foods.length ? foods.map((food) => `${food.name} - ₹${food.price}`).join(', ') : 'No popular dishes available.';
    return {
      reply: `Our popular picks are: ${items}.`,
      quickReplies: ['Vegetarian food', 'Budget meals', 'Desserts'],
    };
  }

  if (/(vegetarian|veg)/.test(lower)) {
    const foods = await Food.find({ isAvailable: true, category: { $in: ['Starters', 'Main Course', 'Desserts', 'Beverages'] } }).limit(5).lean();
    const items = foods.length ? foods.map((food) => `${food.name} - ₹${food.price}`).join(', ') : 'No vegetarian options are available right now.';

    return {
      reply: `Vegetarian-friendly picks: ${items}.`,
      quickReplies: ['Show menu', 'Budget meals', 'Desserts'],
    };
  }

  const budgetMatch = lower.match(/under\s*₹?\d+|under\s*\d+|budget\s*\d+|\d+/);
  if (/(budget|cheap|affordable)/.test(lower) || budgetMatch) {
    const maxPrice = budgetMatch ? Number((budgetMatch[0].match(/\d+/) || ['200'])[0]) : 200;
    const foods = await Food.find({ isAvailable: true, price: { $lte: maxPrice } }).limit(5).lean();
    const items = foods.length ? foods.map((food) => `${food.name} - ₹${food.price}`).join(', ') : `No dishes under ₹${maxPrice}.`;

    return {
      reply: `Budget-friendly options under ₹${maxPrice}: ${items}.`,
      quickReplies: ['Show menu', 'Popular dishes'],
    };
  }

  if (/(breakfast|lunch|dinner)/.test(lower)) {
    const time = /(breakfast)/.test(lower) ? 'breakfast' : /(lunch)/.test(lower) ? 'lunch' : 'dinner';
    const pick = time === 'breakfast'
      ? 'Beverages and light starters'
      : time === 'lunch'
        ? 'Main Course and Biryani selections'
        : 'Comfort meals and desserts';

    return {
      reply: `For ${time}, I suggest ${pick}. You can explore our menu for fresh options and add your choice to the cart.`,
      quickReplies: ['Show menu', 'Main Course', 'Desserts'],
    };
  }

  if (/starters|main course|biryani|fast food|desserts|beverages/.test(lower)) {
    const category = lower.includes('starter') ? 'Starters' : lower.includes('main') ? 'Main Course' : lower.includes('biryani') ? 'Biryani' : lower.includes('fast') ? 'Fast Food' : lower.includes('dessert') ? 'Desserts' : 'Beverages';
    const foods = await Food.find({ category, isAvailable: true }).limit(5).lean();
    const items = foods.length ? foods.map((food) => `${food.name} - ₹${food.price}`).join(', ') : `No ${category.toLowerCase()} items right now.`;

    return {
      reply: `${category} options: ${items}.`,
      quickReplies: ['Show menu', 'Popular dishes'],
    };
  }

  if (/price|cost|how much|costs/.test(lower)) {
    const itemName = text.replace(/(price|cost|how much|how many|does|of|it|costs)/gi, '').trim();
    const food = itemName ? await Food.findOne({ name: { $regex: itemName, $options: 'i' } }) : null;

    if (food) {
      return {
        reply: `${food.name} is priced at ₹${food.price}. It is currently ${food.isAvailable ? 'available' : 'unavailable'}.`,
        quickReplies: ['Add to cart', 'Menu', 'Popular dishes'],
      };
    }

    return {
      reply: 'Tell me which item you want to check, and I will give you the price.',
      quickReplies: ['Paneer Tikka', 'Butter Chicken', 'Mango Shake'],
    };
  }

  if (/cart|checkout|order/.test(lower)) {
    return {
      reply: 'You can add food items from the menu page to your cart, then go to the cart page to review quantities and place your order with cash on delivery.',
      quickReplies: ['Show menu', 'My orders'],
    };
  }

  if (/(opening|hours|delivery|service|contact|address|restaurant)/.test(lower)) {
    const info = getRestaurantInfo();
    return {
      reply: `${info.name} is open ${info.openingHours}. ${info.delivery} Contact: ${info.contact} Email: ${info.email}.`,
      quickReplies: ['Show menu', 'Contact', 'Delivery'],
    };
  }

  return {
    reply: 'I can help with our menu, food suggestions, ordering, and restaurant information. Please ask a question like “Show menu”, “Vegetarian options”, or “Opening hours”.',
    quickReplies: ['Show menu', 'Popular dishes', 'Opening hours'],
  };
};

const sendMessage = async (req, res) => {
  try {
    const message = req.body.message || '';
    const reply = await buildChatbotReply(message);
    return res.json(reply);
  } catch (error) {
    return res.status(500).json({ reply: 'Sorry, the chatbot is unavailable right now. Please try again later.', quickReplies: ['Menu', 'Help'] });
  }
};

module.exports = { buildChatbotReply, getRestaurantInfo, sendMessage };
