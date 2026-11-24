
import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const emptyProduct = {
    category: "",
    name: "",
    description: "",
    price: "",
    stock: "",
  };

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(emptyProduct);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState("Confirmed");

  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);

 
const getAllPages = async (url) => {
  let results = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await api.get(nextUrl);

    const data = response.data;

    if (Array.isArray(data)) {
      results = [...results, ...data];
      nextUrl = null;
    } else {
      results = [...results, ...(data.results || [])];

      if (data.next) {
        const next = new URL(data.next);
        nextUrl = next.pathname + next.search;
        nextUrl = nextUrl.replace("/api/", "");
      } else {
        nextUrl = null;
      }
    }
  }

  return results;
};

const loadData = async () => {
  try {
    const categoryResponse = await api.get("categories/");

    setCategories(
      categoryResponse.data.results || categoryResponse.data
    );

    const allProducts = await getAllPages("products/");
    const allOrders = await getAllPages("admin/orders/");

    setProducts(allProducts);
    setOrders(allOrders);

  } catch (error) {
    setMessage(
      error.response?.data?.detail ||
      "Unable to load admin data. Check your staff account."
    );
  }
};


  useEffect(() => {
    loadData();
  }, []);

  const handleProductChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.entries(product).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (image) {
        formData.append("image", image);
      }

      if (editingId) {
        await api.patch(`products/${editingId}/`, formData);
        setMessage("Product updated successfully");
      } else {
        await api.post("products/", formData);
        setMessage("Product added successfully");
      }

      setProduct(emptyProduct);
      setImage(null);
      setEditingId(null);
      loadData();
    } catch (error) {
      setMessage(
        JSON.stringify(error.response?.data || "Unable to save product")
      );
    }
  };

  const editProduct = (item) => {
    setEditingId(item.id);
    setProduct({
      category: item.category,
      name: item.name,
      description: item.description || "",
      price: item.price,
      stock: item.stock,
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`products/${id}/`);
      setMessage("Product deleted");
      loadData();
    } catch {
      setMessage("Unable to delete product");
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();

    try {
      if (editingCategoryId) {
        await api.patch(`categories/${editingCategoryId}/`, {
          name: categoryName,
        });
        setMessage("Category updated");
      } else {
        await api.post("categories/", { name: categoryName });
        setMessage("Category added");
      }

      setCategoryName("");
      setEditingCategoryId(null);
      loadData();
    } catch (error) {
      setMessage(
        JSON.stringify(error.response?.data || "Unable to save category")
      );
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`categories/${id}/`);
      setMessage("Category deleted");
      loadData();
    } catch {
      setMessage("Unable to delete category. Products may use this category.");
    }
  };

  const updateOrderStatus = async (e) => {
    e.preventDefault();

    try {
      const response = await api.patch(
        `admin/orders/${orderId}/status/`,
        { status: orderStatus }
      );

      setMessage(response.data.message);
      setOrderId("");
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Unable to update order. Check the order ID and status transition."
      );
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="text-success mb-4">Admin Dashboard</h2>

      <div className="alert alert-info">
        This page requires a Django staff account. The backend checks
        staff permissions when you save, edit or delete data.
      </div>

      {message && <div className="alert alert-secondary">{message}</div>}

      <div className="card p-4 mb-4">
        <h4>{editingId ? "Edit Product" : "Add Product"}</h4>

        <form onSubmit={saveProduct}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Product Name</label>
              <input
                className="form-control"
                name="name"
                value={product.name}
                onChange={handleProductChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={product.category}
                onChange={handleProductChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                name="price"
                value={product.price}
                onChange={handleProductChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Stock</label>
              <input
                type="number"
                min="0"
                className="form-control"
                name="stock"
                value={product.stock}
                onChange={handleProductChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={product.description}
                onChange={handleProductChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Product Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
          </div>

          <button className="btn btn-success mt-3">
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary mt-3 ms-2"
              onClick={() => {
                setEditingId(null);
                setProduct(emptyProduct);
                setImage(null);
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="card p-4 mb-4">
        <h4>Manage Categories</h4>

        <form onSubmit={saveCategory} className="row g-2 mb-3">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>

          <div className="col-md-4">
            <button className="btn btn-success w-100">
              {editingCategoryId ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>

        {categories.map((item) => (
          <div
            key={item.id}
            className="d-flex justify-content-between align-items-center border-bottom py-2"
          >
            <span>{item.name}</span>

            <div>
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() => {
                  setEditingCategoryId(item.id);
                  setCategoryName(item.name);
                }}
              >
                Edit
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteCategory(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-4">
        <h4>Manage Products</h4>

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category_name}</td>
                  <td>₹{item.price}</td>
                  <td>{item.stock}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => editProduct(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteProduct(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <h4>Update Order Status</h4>

        <form onSubmit={updateOrderStatus}>
          <label className="form-label">Order ID</label>
          <input
            type="number"
            className="form-control mb-3"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />

          <label className="form-label">New Status</label>
          <select
            className="form-select mb-3"
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            <option value="Confirmed">Confirmed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>

          <button className="btn btn-success">Update Order</button>
        </form>

        <p className="text-muted mt-3 mb-0">
          Status must follow the backend sequence:
          Pending → Confirmed → Packed → Shipped → Delivered.
        </p>
      </div>


<div className="card p-4 mt-4">
  <h4>All Customer Orders</h4>

  {orders.length === 0 ? (
    <p>No customer orders found.</p>
  ) : (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Order Date</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.username}</td>
              <td>₹{order.total_amount}</td>
              <td>{order.phone}</td>
              <td>{order.status}</td>
              <td>
                {new Date(order.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
    </div>
  );
};

export default AdminDashboard;
