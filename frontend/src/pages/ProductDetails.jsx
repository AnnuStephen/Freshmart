
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`products/${id}/`)
      .then((response) => setProduct(response.data))
      .catch(() => alert("Product not found"));
  }, [id]);

  if (!product) return <p className="container mt-4">Loading product...</p>;

  const image = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `http://127.0.0.1:8000${product.image}`
    : "https://placehold.co/500x350?text=FreshMart";

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-5">
          <img src={image} alt={product.name} className="img-fluid rounded" />
        </div>

        <div className="col-md-7">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>Category: {product.category_name}</p>
          <h3 className="text-success">₹{product.price}</h3>
          <p>Available stock: {product.stock}</p>

          <button
            className="btn btn-success"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product.id)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
