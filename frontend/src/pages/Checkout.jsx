
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loadCart } = useCart();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("checkout/", {
        shipping_address: address,
        phone,
      });

      await loadCart();

      alert(
        `Order placed successfully! Order ID: ${response.data.order_id}`
      );

      navigate("/orders");
    } catch (error) {
      setError(
        error.response?.data?.error || "Unable to place order"
      );
    }
  };

  return (
    <div className="container mt-4">
      <div className="form-container">
        <h2 className="text-success">Checkout</h2>

        <h5 className="mb-3">Total Amount: ₹{cart.total}</h5>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Delivery Address</label>
          <textarea
            className="form-control mb-3"
            rows="4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <label className="form-label">Phone Number</label>
          <input
            className="form-control mb-3"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            minLength="10"
            maxLength="15"
            required
          />

          <button
            className="btn btn-success w-100"
            disabled={cart.items.length === 0}
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
