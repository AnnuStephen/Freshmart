
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="p-5 bg-light rounded text-center">
        <h1 className="display-4 fw-bold text-success">
          Welcome to FreshMart
        </h1>
        <p className="lead">
          Fresh groceries delivered to your doorstep.
        </p>
        <Link to="/products" className="btn btn-success btn-lg">
          Shop Now
        </Link>
      </div>

      <div className="row mt-5 text-center">
        <div className="col-md-4">
          <h3>Fresh Products</h3>
          <p>Explore our grocery collection.</p>
        </div>
        <div className="col-md-4">
          <h3>Easy Shopping</h3>
          <p>Add your favourite products to your cart.</p>
        </div>
        <div className="col-md-4">
          <h3>Order Tracking</h3>
          <p>Track your orders from placement to delivery.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
