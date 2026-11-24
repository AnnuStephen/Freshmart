
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });

  const loadCart = async () => {
    if (!user) {
      setCart({ items: [], total: 0 });
      return;
    }

    try {
      const response = await api.get("cart/");
      setCart(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const response = await api.post("cart/add/", {
      product_id: productId,
      quantity,
    });
    setCart(response.data);
  };

  const updateQuantity = async (id, quantity) => {
    const response = await api.put(`cart/update/${id}/`, {
      quantity,
    });
    setCart(response.data);
  };

  const removeItem = async (id) => {
    const response = await api.delete(`cart/remove/${id}/`);
    setCart(response.data);
  };

  const clearCart = async () => {
    await api.delete("cart/clear/");
    await loadCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loadCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
