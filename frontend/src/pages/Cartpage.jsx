import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../component/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
  const [busyId, setBusyId] = useState(null);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    setBusyId(productId);
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      // errors surface inline per item via a shared toast-free approach; keep it simple
      console.error(err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await removeFromCart(productId);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading cart...</p>
      </div>
    );
  }

  const items = cart.items ?? [];
  const totalAmount = cart.totalAmount ?? items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <Link to="/" className="text-sm text-slate-400 hover:text-white">
        ← Continue shopping
      </Link>

      <div className="max-w-3xl mx-auto mt-6">
        <h1 className="text-2xl font-semibold text-white">Your cart</h1>

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

        {items.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm">Your cart is empty.</p>
            <Link
              to="/"
              className="inline-block mt-4 text-sm text-orange-400 hover:text-orange-300"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.product}
                  className="flex items-center gap-4 p-4 bg-slate-900"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">₹{item.price}</p>
                  </div>

                  <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      disabled={busyId === item.product}
                      onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                      className="w-8 h-8 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={busyId === item.product}
                      onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                      className="w-8 h-8 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-20 text-right text-sm text-white shrink-0">
                    ₹{item.price * item.quantity}
                  </p>

                  <button
                    type="button"
                    disabled={busyId === item.product}
                    onClick={() => handleRemove(item.product)}
                    className="text-xs text-slate-500 hover:text-red-400 disabled:opacity-50"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-slate-500 hover:text-red-400"
              >
                Clear cart
              </button>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-semibold text-orange-400">₹{totalAmount}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium text-sm rounded-lg py-3 transition-colors"
            >
              Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}