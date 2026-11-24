
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();

  const imageUrl = (image) => {
    if (!image) return "https://placehold.co/100x80?text=Product";
    return image.startsWith("http")
      ? image
      : `http://127.0.0.1:8000${image}`;
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">Shopping Cart</h2>

      {cart.items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn-success">
            Shop Products
          </Link>
        </div>
      ) : (
        <>
          {cart.items.map((item) => (
            <div className="card mb-3" key={item.id}>
              <div className="card-body row align-items-center">
                <div className="col-md-2">
                  <img
                    src={imageUrl(item.image)}
                    alt={item.product_name}
                    className="img-fluid"
                  />
                </div>

                <div className="col-md-3">
                  <h5>{item.product_name}</h5>
                  <p>₹{item.product_price}</p>
                </div>

                <div className="col-md-3">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                  >
                    -
                  </button>

                  <span className="mx-3">{item.quantity}</span>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <div className="col-md-2">
                  <strong>₹{item.subtotal}</strong>
                </div>

                <div className="col-md-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <h4 className="text-end">
            Total: ₹{cart.total}
          </h4>

          <div className="text-end mt-3">
            <button className="btn btn-outline-danger me-2" onClick={clearCart}>
              Clear Cart
            </button>
            <Link to="/checkout" className="btn btn-success">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
