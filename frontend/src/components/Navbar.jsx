
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const count = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          FreshMart
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">Home</Link>
            <Link className="nav-link" to="/products">Products</Link>

            {user ? (
              <>
                <Link className="nav-link" to="/cart">
                  Cart ({count})
                </Link>
                <Link className="nav-link" to="/wishlist">Wishlist</Link>
                <Link className="nav-link" to="/orders">My Orders</Link>
                <Link className="nav-link" to="/profile">Profile</Link>
           {user && user.is_staff && (
  <Link className="nav-link" to="/admin">
    Admin Dashboard
  </Link>
)}
                <button
                  className="btn btn-light btn-sm ms-lg-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
