
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const { addToCart } = useCart();

  const loadWishlist = async () => {
    try {
      const response = await api.get("wishlist/");
      setItems(response.data);
    } catch {
      alert("Unable to load wishlist");
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (id) => {
    try {
      await api.delete(`wishlist/remove/${id}/`);
      loadWishlist();
    } catch {
      alert("Unable to remove item");
    }
  };

  const imageUrl = (image) => {
    if (!image) return "https://placehold.co/120x100?text=Product";
    return image.startsWith("http")
      ? image
      : `http://127.0.0.1:8000${image}`;
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">My Wishlist</h2>

      {items.length === 0 && <p>Your wishlist is empty.</p>}

      <div className="row g-3">
        {items.map((item) => {
          const product = item.product_details;

          return (
            <div className="col-md-4" key={item.id}>
              <div className="card h-100">
                <img
                  src={imageUrl(product.image)}
                  className="card-img-top product-image"
                  alt={product.name}
                />

                <div className="card-body">
                  <h5>{product.name}</h5>
                  <p className="text-success">₹{product.price}</p>

                  <button
                    className="btn btn-success me-2"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
