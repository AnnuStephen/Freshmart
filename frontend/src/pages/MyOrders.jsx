
import { useEffect, useState } from "react";
import api from "../api/axios";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const response = await api.get("my-orders/");
      setOrders(response.data.results || response.data);
    } catch {
      alert("Unable to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await api.post(`orders/cancel/${id}/`);
      alert("Order cancelled");
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.error || "Unable to cancel order");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">My Orders</h2>

      {orders.length === 0 && <p>You have not placed any orders.</p>}

      {orders.map((order) => (
        <div className="card mb-3" key={order.id}>
          <div className="card-body">
            <h5>Order #{order.id}</h5>
            <p>Order Date: {new Date(order.created_at).toLocaleString()}</p>
            <p>Delivery Address: {order.shipping_address}</p>
            <p>Phone: {order.phone}</p>
            <p>Total: ₹{order.total_amount}</p>

            <h6>
              Status: <span className="text-success">{order.status}</span>
            </h6>

            <h6>Products</h6>
            {order.items.map((item) => (
              <p key={item.id}>
                {item.product_name} — Quantity: {item.quantity} —
                ₹{item.price}
              </p>
            ))}

            {["Pending", "Confirmed"].includes(order.status) && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => cancelOrder(order.id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
