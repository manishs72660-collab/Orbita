import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../utils/Axiosclient";
import { useAuth } from "../component/Authcontext";
import { useCart } from "../component/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImg(0);
    setQuantity(1);
    setJustAdded(false);

    axiosClient
      .get(`/product/${id}`)
      .then((res) => {
        setProduct(res.data?.message ?? null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      await addToCart(product._id, quantity);
      setJustAdded(true);
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/checkout", { state: { productId: product._id, quantity } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-400">{error || "Product not found"}</p>
        <Link to="/" className="text-sm text-orange-400 hover:text-orange-300">
          Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = (product.stock ?? 0) <= 0;

  // Cart items may come back with `product` as a populated object or a raw id,
  // and IDs can be ObjectId vs string — normalize both sides before comparing.
  const isInCart =
    justAdded ||
    (cart?.items ?? []).some((item) => {
      const itemProductId =
        typeof item.product === "object" && item.product !== null
          ? item.product._id
          : item.product;
      return String(itemProductId) === String(product._id);
    });

  const hasDiscount = Number(product.discount) > 0;
  const images = product.images ?? [];

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <Link to="/" className="text-sm text-slate-400 hover:text-white">
        ← Back to products
      </Link>

      <div className="max-w-4xl mx-auto mt-6 grid md:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-square bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {images[activeImg]?.url ? (
              <img
                src={images[activeImg].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                No image available
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImg((i) => (i === 0 ? images.length - 1 : i - 1))
                  }
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-slate-950/70 border border-slate-700 text-white text-lg hover:bg-slate-900"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImg((i) => (i === images.length - 1 ? 0 : i + 1))
                  }
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-slate-950/70 border border-slate-700 text-white text-lg hover:bg-slate-900"
                >
                  ›
                </button>
                <span className="absolute bottom-2 right-2 text-xs text-slate-300 bg-slate-950/70 px-2 py-0.5 rounded-full">
                  {activeImg + 1} / {images.length}
                </span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={img.public_id ?? i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border ${
                    i === activeImg ? "border-orange-500" : "border-slate-800"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              {product.category}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-white mt-1">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-xl font-semibold text-orange-400">
              ₹{product.finalPrice}
            </span>
            {hasDiscount && (
              <>
                <span className="text-sm text-slate-500 line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          <p
            className={`text-xs mt-4 ${
              outOfStock ? "text-red-400" : "text-slate-500"
            }`}
          >
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </p>

          {!outOfStock && (
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 text-slate-300 hover:bg-slate-900"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="w-9 h-9 text-slate-300 hover:bg-slate-900"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {isInCart ? (
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-medium text-sm rounded-lg py-2.5 transition-colors"
                >
                  View cart
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-medium text-sm rounded-lg py-2.5 transition-colors"
                >
                  {adding ? "Adding..." : "Add to cart"}
                </button>
              )}
            </div>
          )}

          {addError && <p className="text-xs text-red-400 mt-3">{addError}</p>}

          {!outOfStock && (
            <button
              type="button"
              onClick={handlePlaceOrder}
              className="w-full mt-3 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-sm rounded-lg py-2.5 transition-colors"
            >
              Place order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}