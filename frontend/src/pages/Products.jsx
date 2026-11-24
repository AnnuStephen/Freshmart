
import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ordering, setOrdering] = useState("");
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    const response = await api.get("categories/");
    setCategories(response.data.results || response.data);
  };

  const loadProducts = async (pageNumber = 1) => {
    try {
      setError("");

      const params = { page: pageNumber };

      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (ordering) params.ordering = ordering;

      const response = await api.get("products/", { params });
      const data = response.data;

      setProducts(Array.isArray(data) ? data : data.results || []);
      setNext(data.next || null);
      setPrevious(data.previous || null);
      setPage(pageNumber);
    } catch (error) {
      setError("Unable to load products.");
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1);
  };


const clearFilters = async () => {
  setSearch("");
  setCategory("");
  setMinPrice("");
  setMaxPrice("");
  setOrdering("");
  setError("");

  try {
    const response = await api.get("products/");

    const data = response.data;

    setProducts(
      Array.isArray(data) ? data : data.results || []
    );

    setNext(data.next || null);
    setPrevious(data.previous || null);
    setPage(1);
  } catch {
    setError("Unable to load products.");
  }
};

  return (
    <div className="container mt-4">
      <h2 className="text-success mb-4">Our Products</h2>

      <form onSubmit={handleSearch} className="row g-2 mb-4">
        <div className="col-md-3">
          <input
            className="form-control"
            placeholder="Search product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
          >
            <option value="">Default Order</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
            <option value="-name">Name: Z to A</option>
          </select>
        </div>

        <div className="col-md-1">
          <button className="btn btn-success w-100">Search</button>
        </div>
      </form>
<button
  className="btn btn-outline-secondary mb-3"
  onClick={clearFilters}
>
  Clear Filters
</button>

      {error && <p className="text-danger">{error}</p>}

      <div className="row g-4">
        {products.map((product) => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length === 0 && <p>No products found.</p>}

      <div className="d-flex justify-content-center gap-3 my-4">
        <button
          className="btn btn-outline-success"
          disabled={!previous}
          onClick={() => loadProducts(page - 1)}
        >
          Previous
        </button>
        <span className="align-self-center">Page {page}</span>
        <button
          className="btn btn-outline-success"
          disabled={!next}
          onClick={() => loadProducts(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Products;
