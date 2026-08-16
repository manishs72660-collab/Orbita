import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, Minus, Plus, Check } from "lucide-react";
import axiosClient from "../utils/Axiosclient";
import { useAuth } from "../component/Authcontext";
import { useCart } from "../component/CartContext";

/**
 * CACAO NOIR — product detail page
 * Same brand system as the homepage: pure-dark ground, antique-gold /
 * ember accents, Fraunces (display) + Inter (body) + JetBrains Mono
 * (price/data). The gallery reuses the homepage's poster-card language
 * (scrim, quiet zoom) and the CTA reuses the gold→ember gradient from
 * the active category chip, so the two pages read as one product.
 */

const FONT_IMPORTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const STYLES = `
${FONT_IMPORTS}

.cn-root {
  background: #050505;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

.cn-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
.cn-mono { font-family: 'JetBrains Mono', monospace; }

.cn-hairline { background: linear-gradient(90deg, transparent, rgba(176,141,87,0.5), transparent); height: 1px; }

@keyframes cn-rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
.cn-rise { animation: cn-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }

@keyframes cn-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.cn-loading-dot { animation: cn-pulse 1.2s ease-in-out infinite; }

.cn-back {
  color: #8A8078;
  transition: color 0.25s ease, gap 0.25s ease;
}
.cn-back:hover { color: #E3C287; }

/* ---------------- GALLERY ---------------- */
.cn-gallery-stage {
  position: relative;
  overflow: hidden;
  background: #0B0807;
  border-radius: 18px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 24px 50px -28px rgba(0,0,0,0.75);
}

.cn-gallery-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 1s cubic-bezier(0.16,1,0.3,1), filter 0.6s ease;
  filter: saturate(0.94) brightness(0.97);
}
.cn-gallery-stage:hover .cn-gallery-img {
  transform: scale(1.045);
  filter: saturate(1.06) brightness(1.01);
}

.cn-gallery-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(3,2,2,0.55) 0%, transparent 30%);
  pointer-events: none;
}

.cn-nav-btn {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 999px;
  background: rgba(5,5,5,0.55);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(237,230,220,0.2);
  color: #EDE6DC;
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
}
.cn-nav-btn:hover { border-color: #B08D57; background: rgba(176,141,87,0.22); transform: translateY(-1px); }

.cn-counter {
  font-family: 'JetBrains Mono', monospace;
  background: rgba(5,5,5,0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(237,230,220,0.18);
  color: #C9BBAB;
}

.cn-thumb {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgba(176,141,87,0.16);
  opacity: 0.6;
  transition: opacity 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.cn-thumb:hover { opacity: 0.9; transform: translateY(-1px); }
.cn-thumb[data-active="true"] {
  opacity: 1;
  border-color: #E3C287;
  box-shadow: 0 0 0 1px rgba(227,194,135,0.35);
}

/* ---------------- INFO PANEL ---------------- */
.cn-badge {
  font-family: 'JetBrains Mono', monospace;
  color: #B08D57;
  border: 1px solid rgba(176,141,87,0.3);
  background: rgba(176,141,87,0.06);
}
.cn-discount-pill {
  font-family: 'JetBrains Mono', monospace;
  color: #050505;
  background: linear-gradient(135deg, #C89B4C, #E8C687);
}

.cn-stepper {
  border: 1px solid rgba(176,141,87,0.25);
  border-radius: 12px;
  overflow: hidden;
}
.cn-stepper button {
  transition: background 0.2s ease, color 0.2s ease;
  color: #C9BBAB;
}
.cn-stepper button:hover:not(:disabled) { background: rgba(176,141,87,0.12); color: #EDE6DC; }
.cn-stepper button:disabled { opacity: 0.3; cursor: not-allowed; }

.cn-cta-primary {
  background: linear-gradient(135deg, #C89B4C, #8B3A2B);
  color: #050505;
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  box-shadow: 0 14px 30px -14px rgba(176,141,87,0.5);
}
.cn-cta-primary:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 18px 36px -14px rgba(176,141,87,0.65); }
.cn-cta-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.cn-cta-secondary {
  border: 1px solid rgba(176,141,87,0.3);
  color: #C9BBAB;
  transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
}
.cn-cta-secondary:hover { border-color: #B08D57; color: #EDE6DC; background: rgba(176,141,87,0.06); }

.cn-instock { color: #8FBF9A; }
.cn-outstock { color: #C97C6A; }

@media (prefers-reduced-motion: reduce) {
  .cn-rise, .cn-loading-dot, .cn-gallery-img { animation: none !important; transition: none !important; }
}
`;

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
      <div className="cn-root flex items-center justify-center">
        <style>{STYLES}</style>
        <div className="flex items-center gap-2">
          <span className="cn-loading-dot w-1.5 h-1.5 rounded-full bg-[#B08D57]" style={{ animationDelay: "0s" }} />
          <span className="cn-loading-dot w-1.5 h-1.5 rounded-full bg-[#B08D57]" style={{ animationDelay: "0.2s" }} />
          <span className="cn-loading-dot w-1.5 h-1.5 rounded-full bg-[#B08D57]" style={{ animationDelay: "0.4s" }} />
          <span className="cn-mono text-xs text-[#6E655C] uppercase tracking-widest ml-2">
            Loading
          </span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="cn-root flex flex-col items-center justify-center gap-4 px-6 text-center">
        <style>{STYLES}</style>
        <p className="cn-display italic text-xl text-[#EDE6DC]">
          {error || "Product not found"}
        </p>
        <Link to="/" className="cn-mono text-xs uppercase tracking-widest text-[#B08D57] hover:text-[#E3C287] transition-colors">
          ← Back to the collection
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
    <div className="cn-root px-6 py-10">
      <style>{STYLES}</style>

      <div className="max-w-5xl mx-auto">
        <Link to="/" className="cn-back cn-mono inline-flex items-center gap-2 text-xs uppercase tracking-widest">
          <ArrowLeft size={13} />
          Back to the collection
        </Link>

        <div className="mt-8 grid md:grid-cols-2 gap-10 md:gap-12">
          {/* -------- gallery -------- */}
          <div className="cn-rise">
            <div className="cn-gallery-stage aspect-square">
              {images[activeImg]?.url ? (
                <img
                  src={images[activeImg].url}
                  alt={product.name}
                  className="cn-gallery-img"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="cn-display text-[#2A211B] text-3xl italic">CN</span>
                </div>
              )}

              <div className="cn-gallery-scrim" />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImg((i) => (i === 0 ? images.length - 1 : i - 1))
                    }
                    aria-label="Previous image"
                    className="cn-nav-btn absolute left-3 top-1/2 -translate-y-1/2"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImg((i) => (i === images.length - 1 ? 0 : i + 1))
                    }
                    aria-label="Next image"
                    className="cn-nav-btn absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="cn-counter absolute bottom-3 right-3 text-[10px] px-2.5 py-1 rounded-full tracking-widest">
                    {activeImg + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3">
                {images.map((img, i) => (
                  <button
                    key={img.public_id ?? i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    data-active={i === activeImg}
                    className="cn-thumb w-16 h-16 shrink-0"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* -------- info -------- */}
          <div className="cn-rise" style={{ animationDelay: "100ms" }}>
            {product.category && (
              <span className="cn-badge inline-block text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest">
                {product.category}
              </span>
            )}

            <h1 className="cn-display text-3xl sm:text-4xl italic font-light text-[#F5EFE6] mt-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="cn-mono text-2xl text-[#E3C287]">
                ₹{product.finalPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="cn-mono text-sm text-[#6E655C] line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="cn-discount-pill text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {product.discount}% off
                  </span>
                </>
              )}
            </div>

            <div className="cn-hairline w-full mt-6" />

            {product.description && (
              <p className="text-sm text-[#A79A8B] mt-6 leading-relaxed">
                {product.description}
              </p>
            )}

            <p className={`cn-mono text-xs mt-6 uppercase tracking-wide ${outOfStock ? "cn-outstock" : "cn-instock"}`}>
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </p>

            {!outOfStock && (
              <div className="flex items-center gap-3 mt-6">
                <div className="cn-stepper flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="cn-mono w-10 text-center text-sm text-[#EDE6DC]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {isInCart ? (
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="cn-cta-primary flex-1 flex items-center justify-center gap-2 font-medium text-sm rounded-xl py-3"
                  >
                    <Check size={15} />
                    View cart
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="cn-cta-primary flex-1 font-medium text-sm rounded-xl py-3"
                  >
                    {adding ? "Adding…" : "Add to cart"}
                  </button>
                )}
              </div>
            )}

            {addError && (
              <p className="text-xs text-[#C97C6A] mt-3">{addError}</p>
            )}

            {!outOfStock && (
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="cn-cta-secondary w-full mt-3 font-medium text-sm rounded-xl py-3"
              >
                Place order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}