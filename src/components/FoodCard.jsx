const FoodCard = ({ food, onAddToCart }) => {
  return (
    <div className="food-card">
      <img src={food.image} alt={food.name} className="food-image" />
      <div className="food-body">
        <div className="food-header-row">
          <h4>{food.name}</h4>
          <span className="badge bg-success">{food.isAvailable ? 'Available' : 'Unavailable'}</span>
        </div>
        <p>{food.description}</p>
        <div className="food-meta-row">
          <span className="food-category">{food.category}</span>
          <strong>₹{food.price}</strong>
        </div>
        <button className="primary-btn" onClick={() => onAddToCart(food)} disabled={!food.isAvailable}>
          {food.isAvailable ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
