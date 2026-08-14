import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../component/Authcontext";
import { useCart } from "../component/CartContext";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();

  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [addError, setAddError] = useState("");

  const outOfStock = (product.stock ?? 0) <= 0;
  const hasDiscount = Number(product.discount) > 0;
  const image = product.images?.[0]?.url;

  const isInCart =
    justAdded ||
    (cart?.items ?? []).some((item) => {
      const itemProductId =
        typeof item.product === "object" && item.product !== null
          ? item.product._id
          : item.product;
      return String(itemProductId) === String(product._id);
    });

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth");
      return;
    }
    if (outOfStock || adding) return;

    setAdding(true);
    setAddError("");
    try {
      await addToCart(product._id, 1);
      setJustAdded(true);
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || "Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const handleViewCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/cart");
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors"
    >
      <div className="relative aspect-square bg-slate-950">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {product.discount}% off
          </span>
        )}

        {outOfStock && (
          <span className="absolute top-2 right-2 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4">
        {product.category && (
          <p className="text-[11px] text-slate-500 uppercase tracking-wide">
            {product.category}
          </p>
        )}
        <h3 className="text-sm font-medium text-white mt-1 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-semibold text-orange-400">
            ₹{product.finalPrice}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-500 line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {addError && <p className="text-[11px] text-red-400 mt-1">{addError}</p>}

        {!outOfStock &&
          (isInCart ? (
            <button
              type="button"
              onClick={handleViewCart}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium text-xs rounded-lg py-2 transition-colors"
            >
              View cart
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-medium text-xs rounded-lg py-2 transition-colors"
            >
              {adding ? "Adding..." : "Add to cart"}
            </button>
          ))}
      </div>
    </Link>
  );
}