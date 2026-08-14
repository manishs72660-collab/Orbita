import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import axiosClient from "../utils/Axiosclient";
import { useAuth } from "./Authcontext";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], totalItems: 0, totalAmount: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guards against a slow /cart response landing after the user has
  // already logged out (or logged in as someone else) and overwriting
  // the cart with stale data.
  const requestIdRef = useRef(0);

  const fetchCart = useCallback(() => {
    const requestId = ++requestIdRef.current;

    if (!user) {
      setCart(EMPTY_CART);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    axiosClient
      .get("/cart")
      .then((res) => {
        if (requestIdRef.current !== requestId) return; // stale response, ignore
        setCart(res.data?.message ?? EMPTY_CART);
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return;
        setError(err.response?.data?.message || err.message || "Failed to load cart");
      })
      .finally(() => {
        if (requestIdRef.current !== requestId) return;
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setError("");
    try {
      const res = await axiosClient.post("/cart/add", { productId, quantity });
      setCart(res.data.message);
      return res.data.message;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add to cart");
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setError("");
    try {
      const res = await axiosClient.put(`/cart/update/${productId}`, { quantity });
      setCart(res.data.message);
      return res.data.message;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update quantity");
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    setError("");
    try {
      const res = await axiosClient.delete(`/cart/remove/${productId}`);
      setCart(res.data.message);
      return res.data.message;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to remove item");
      throw err;
    }
  };

  const clearCart = async () => {
    setError("");
    try {
      const res = await axiosClient.delete("/cart/clear");
      setCart(res.data.message);
      return res.data.message;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to clear cart");
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount: cart.totalItems ?? cart.items.reduce((s, i) => s + i.quantity, 0),
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}