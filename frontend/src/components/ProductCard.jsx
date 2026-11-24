
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

const imageUrl = (image) => {
  if (!image) return "https://placehold.co/400x300?text=FreshMart";
  return image.startsWith("http")
    ? image
    : `http://127.0.0.1:8000${image}`;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const addWishlist = async () => {
    try {
      await api.post("wishlist/", { product_id: product.id });
      alert("Added to wishlist");
    } catch (error) {
      alert(error.response?.data?.detail || "Please login first");
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={imageUrl(product.image)}
        className="card-img-top product-image"
        alt={product.name}
      />

      <div className="card-body d-flex flex-column">
        <h5>{product.name}</h5>
        <p className="text-muted">{product.category_name}</p>
        <h5 className="text-success">₹{product.price}</h5>
        <p>Stock: {product.stock}</p>

        <div className="mt-auto d-grid gap-2">
          <Link
            to={`/products/${product.id}`}
            className="btn btn-outline-success"
          >
            View Details
          </Link>

          <button
            className="btn btn-success"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product.id)}
          >
            Add to Cart
          </button>

          <button className="btn btn-outline-danger" onClick={addWishlist}>
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
