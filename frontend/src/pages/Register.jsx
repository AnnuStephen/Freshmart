
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(form);
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      const data = error.response?.data;
      setError(data ? JSON.stringify(data) : "Registration failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="form-container">
        <h2 className="text-success text-center">Create Account</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="form-label">Username</label>
          <input
            name="username"
            className="form-control mb-3"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            value={form.password}
            onChange={handleChange}
            minLength="8"
            required
          />

          <button className="btn btn-success w-100">Register</button>
        </form>

        <p className="text-center mt-3">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
