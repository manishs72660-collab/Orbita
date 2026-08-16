import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  CupSoda,
  Cookie,
  Cake,
  Sparkles,
  Package,
  Eye,
  ChevronDown,
} from "lucide-react";
import axiosClient from "../utils/Axiosclient";
import SearchBar from "../component/SearchBar";

/**
 * CACAO NOIR — homepage (v4, "cinematic")
 *
 * What changed vs v3:
 *  - The header is now a pinned, scroll-driven scene (the thing you see on
 *    car/watch launch sites): as you scroll, the hero holds in place while
 *    it zooms and fades, and a dark "curtain" with rounded top corners
 *    rises up over it — like a new page physically opening on top of the
 *    old one. When the curtain finishes rising it hands off seamlessly
 *    into the real collection section below (same background color, so
 *    there's no seam).
 *  - Product cards are redesigned as full-bleed poster cards: the photo
 *    fills the whole card, name/price sit on a soft bottom scrim, and the
 *    category tag + discount ribbon + quick-view float over the image —
 *    closer to a premium editorial/poster look than a plain thumbnail-
 *    with-caption card.
 *  - Everything still respects prefers-reduced-motion (the scroll-pin
 *    effect degrades to a normal static header + simple fade-in).
 */

const FONT_IMPORTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
`;

const STYLES = `
${FONT_IMPORTS}

.cn-root {
  background: #050505;
  font-family: 'Inter', sans-serif;
  position: relative;
  min-height: 100vh;
}

.cn-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
.cn-mono { font-family: 'JetBrains Mono', monospace; }

/* ---------------- CINEMATIC PINNED HERO ---------------- */
.cn-hero-wrap {
  position: relative;
  height: 220vh; /* scroll distance that drives the pin animation */
}
.cn-hero-pin {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 15% -10%, rgba(139,58,43,0.55), transparent 55%),
    radial-gradient(90% 70% at 90% 0%, rgba(176,141,87,0.35), transparent 60%),
    linear-gradient(180deg, #1A0E09 0%, #0C0806 65%, #050505 100%);
}

.cn-hero-aurora {
  position: absolute;
  inset: -20% -10%;
  background: conic-gradient(from 0deg at 50% 30%,
    rgba(176,141,87,0.16), rgba(139,58,43,0.10), transparent 35%,
    rgba(176,141,87,0.12) 70%, rgba(139,58,43,0.16));
  filter: blur(60px);
  animation: cn-spin 26s linear infinite;
  pointer-events: none;
  will-change: transform;
}
@keyframes cn-spin { to { transform: rotate(360deg); } }

.cn-hero-grain {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  mix-blend-mode: overlay;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.cn-hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 60% at 50% 45%, transparent 40%, #000 100%);
  pointer-events: none;
}

.cn-motif {
  position: absolute;
  color: #D8B27A;
  animation: cn-float 9s ease-in-out infinite;
}
@keyframes cn-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-14px) rotate(8deg); }
}

@keyframes cn-pour {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.cn-pour-line { transform-origin: left; animation: cn-pour 1.2s 0.3s cubic-bezier(0.65,0,0.35,1) both; }

@keyframes cn-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
.cn-scrollcue { animation: cn-bob 1.8s ease-in-out infinite; }

/* the curtain that rises up over the pinned hero, like a new page opening */
.cn-curtain {
  position: absolute;
  inset: 0;
  top: auto;
  height: 100%;
  background: #050505;
  box-shadow: 0 -40px 80px -20px rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform, border-radius;
}

/* ---------------- STICKY FILTER BAR ---------------- */
.cn-filterbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: #050505;
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
  border-bottom: 1px solid transparent;
}
.cn-filterbar[data-stuck="true"] {
  border-color: rgba(176,141,87,0.16);
  box-shadow: 0 12px 30px -20px rgba(0,0,0,0.85);
}

.cn-chip { transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease; }
.cn-chip:hover { transform: translateY(-1px); }
.cn-chip[data-active="true"] {
  background: linear-gradient(135deg, #C89B4C, #8B3A2B);
  color: #050505;
  border-color: transparent;
}
.cn-chip[data-active="false"] {
  background: rgba(255,255,255,0.02);
  color: #A79A8B;
  border-color: rgba(176,141,87,0.22);
}
.cn-chip[data-active="false"]:hover {
  border-color: #B08D57;
  color: #EDE6DC;
  background: rgba(176,141,87,0.08);
}

@keyframes cn-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
.cn-skeleton {
  background: linear-gradient(90deg, #100C0A 0%, #171210 50%, #100C0A 100%);
  background-size: 800px 100%;
  animation: cn-shimmer 1.6s linear infinite;
}

/* ---------------- SCROLL REVEAL (grid items) ---------------- */
.cn-reveal {
  opacity: 0;
  transform: translateY(28px) scale(0.98);
  filter: blur(4px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s ease;
}
.cn-reveal[data-visible="true"] { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

/* ---------------- PREMIUM POSTER PRODUCT CARD ---------------- */
.cn-card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #100C0A;
  box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 18px 30px -22px rgba(0,0,0,0.7);
  transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease;
}
.cn-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 50px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(176,141,87,0.35);
}

.cn-img-stage { position: relative; overflow: hidden; background: #0B0807; height: 100%; }

.cn-card-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transform-origin: center;
  transition: transform 1.2s cubic-bezier(0.16,1,0.3,1), filter 0.7s ease;
  filter: saturate(0.92) brightness(0.9);
}
.cn-card:hover .cn-card-img { transform: scale(1.09); filter: saturate(1.08) brightness(1); }

/* permanent bottom scrim so text is always readable over the photo */
.cn-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(3,2,2,0.94) 0%, rgba(3,2,2,0.55) 32%, transparent 62%);
  pointer-events: none;
}

.cn-mark {
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  color: rgba(237,230,220,0.9);
  background: rgba(5,5,5,0.45);
  backdrop-filter: blur(3px);
  border: 1px solid rgba(237,230,220,0.2);
}
.cn-sale {
  font-family: 'JetBrains Mono', monospace;
  color: #050505;
  background: linear-gradient(135deg, #C89B4C, #E8C687);
  border: 1px solid rgba(176,141,87,0.4);
}

.cn-quickview {
  position: absolute;
  right: 12px; top: 12px;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 999px;
  background: rgba(5,5,5,0.55);
  border: 1px solid rgba(237,230,220,0.25);
  color: #EDE6DC;
  opacity: 0; transform: translateY(-6px) scale(0.9);
  transition: opacity 0.35s ease, transform 0.35s ease, border-color 0.35s ease, background 0.35s ease;
}
.cn-card:hover .cn-quickview { opacity: 1; transform: translateY(0) scale(1); border-color: #B08D57; background: rgba(176,141,87,0.18); }

.cn-name-wrap { position: relative; display: inline-block; }
.cn-name-wrap::after {
  content: ''; position: absolute; left: 0; right: 100%; bottom: -3px; height: 1px;
  background: #E3C287;
  transition: right 0.5s cubic-bezier(0.16,1,0.3,1);
}
.cn-card:hover .cn-name-wrap::after { right: 0; }

.cn-hairline { background: linear-gradient(90deg, transparent, rgba(176,141,87,0.5), transparent); height: 1px; }

@media (prefers-reduced-motion: reduce) {
  .cn-hero-wrap { height: auto; }
  .cn-hero-pin { position: relative; }
  .cn-curtain { display: none; }
  .cn-scrollcue, .cn-hero-aurora, .cn-pour-line, .cn-card-img { animation: none !important; }
  .cn-reveal { opacity: 1 !important; transform: none !important; filter: none !important; }
  .cn-card, .cn-card-img, .cn-quickview, .cn-name-wrap::after { transition: none !important; }
}
`;

/* -------- category → icon mapping -------- */
function getCategoryIcon(name) {
  const n = (name || "").toLowerCase();
  if (n === "all") return Sparkles;
  if (/cold|drink|juice|soda|shake|iced/.test(n)) return CupSoda;
  if (/coffee|espresso|latte|brew/.test(n)) return Coffee;
  if (/cake|pastry|bake/.test(n)) return Cake;
  if (/choco|cacao|cookie|truffle/.test(n)) return Cookie;
  return Package;
}

/* -------- scroll progress through an element's own scroll range -------- */
function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    function measure() {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const maxScroll = rect.height - viewportH;
      const scrolled = -rect.top;
      const p = maxScroll > 0 ? Math.min(Math.max(scrolled / maxScroll, 0), 1) : 0;
      setProgress(p);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(measure);
        ticking = true;
      }
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);

  return progress;
}

/* -------- reveal-on-enter hook for grid items -------- */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function SkeletonCard() {
  return <div className="cn-skeleton aspect-[3/4] rounded-[18px]" />;
}

function ProductCard({ p, index }) {
  const [ref, visible] = useReveal();
  const hasDiscount = p.price && p.finalPrice && p.price > p.finalPrice;
  const discountPct = hasDiscount
    ? Math.round(((p.price - p.finalPrice) / p.price) * 100)
    : null;

  return (
    <Link
      ref={ref}
      to={`/product/${p._id}`}
      data-visible={visible}
      className="cn-card cn-reveal block aspect-[3/4]"
      style={{ transitionDelay: `${Math.min((index % 8) * 70, 400)}ms` }}
    >
      <div className="cn-img-stage">
        {p.images?.[0]?.url ? (
          <img src={p.images[0].url} alt={p.name} className="cn-card-img" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="cn-display text-[#2A211B] text-3xl italic">CN</span>
          </div>
        )}

        <div className="cn-scrim" />

        {p.category && (
          <span className="cn-mark absolute top-3 left-3 text-[9px] px-2 py-1 uppercase tracking-widest z-[2]">
            {p.category}
          </span>
        )}
        {hasDiscount && (
          <span className="cn-sale absolute bottom-3 right-3 text-[9px] px-2 py-1 uppercase tracking-widest font-medium z-[2]">
            -{discountPct}%
          </span>
        )}
        <span className="cn-quickview z-[2]">
          <Eye size={15} />
        </span>

        <div className="absolute left-4 right-4 bottom-4 z-[2]">
          <span className="cn-name-wrap text-[#F5EFE6] text-[15px] font-medium leading-snug">
            {p.name}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="cn-mono text-[#E3C287] text-sm">₹{p.finalPrice}</p>
            {hasDiscount && (
              <p className="cn-mono text-[#8A7C6E] text-xs line-through">₹{p.price}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [stuck, setStuck] = useState(false);

  const heroWrapRef = useRef(null);
  const progress = useScrollProgress(heroWrapRef);

  useEffect(() => {
    axiosClient
      .get("/product")
      .then((res) => {
        setProducts(res.data?.message?.products ?? []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  const onScroll = useCallback(() => {
    setStuck(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const categories = useMemo(() => {
    const found = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(found)];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  // derived cinematic values from scroll progress (0 → 1 across the pin range)
  const heroContentOpacity = Math.max(1 - progress * 1.8, 0);
  const heroContentShift = -progress * 60;
  const heroScale = 1 + progress * 0.1;
  const vignetteOpacity = Math.min(progress * 0.7, 0.7);
  const curtainShift = (1 - progress) * 100; // % — 100 = fully below, 0 = fully covering
  const curtainRadius = 56 * (1 - progress); // px — rounds off until flush
  const curtainTextOpacity = Math.min(Math.max((progress - 0.55) / 0.35, 0), 1);
  const cueOpacity = Math.max(1 - progress * 6, 0);

  return (
    <div className="cn-root">
      <style>{STYLES}</style>

      {/* ---------------- CINEMATIC PINNED HERO ---------------- */}
      <div className="cn-hero-wrap" ref={heroWrapRef}>
        <div className="cn-hero-pin">
          <div
            className="cn-hero-aurora"
            style={{ transform: `scale(${1 + progress * 0.35})` }}
          />
          <div className="cn-hero-grain" />
          <div className="cn-hero-vignette" style={{ opacity: vignetteOpacity }} />

          <svg className="cn-motif" style={{ top: "18%", left: "6%", width: 46, opacity: 0.35 * heroContentOpacity }} viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth="1.4">
            <ellipse cx="20" cy="30" rx="17" ry="27" />
            <path d="M20 3 C 10 20, 10 40, 20 57" />
          </svg>
          <svg className="cn-motif" style={{ top: "55%", right: "8%", width: 60, opacity: 0.35 * heroContentOpacity, animationDelay: "2.2s" }} viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M4 20c0-9 8-16 26-16s26 7 26 16-8 16-26 16S4 29 4 20Z" />
            <path d="M12 20c4-4 8-6 18-6M12 20c4 4 8 6 18 6" />
          </svg>
          <svg className="cn-motif" style={{ top: "8%", right: "22%", width: 30, opacity: 0.35 * heroContentOpacity, animationDelay: "1s" }} viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth="1.4">
            <ellipse cx="20" cy="30" rx="17" ry="27" />
            <path d="M20 3 C 10 20, 10 40, 20 57" />
          </svg>

          <div
            className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center"
            style={{
              opacity: heroContentOpacity,
              transform: `translateY(${heroContentShift}px) scale(${heroScale})`,
            }}
          >
            <div className="flex flex-col items-start gap-6">
              <span className="cn-mono text-[11px] tracking-[0.35em] text-[#E3C287] uppercase">
                Small-batch &middot; Cold-brewed &middot; Dark by nature
              </span>
              <h1 className="cn-display text-[#F5EFE6] text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.03] max-w-3xl">
                Chocolate, coffee, and cold drinks worth{" "}
                <span className="italic text-[#E3C287]">savoring</span>.
              </h1>
              <p className="text-[#C9BBAB] text-base sm:text-lg max-w-xl leading-relaxed">
                Single-origin cacao, slow-steeped coffee, and cold drinks made
                in small batches — no shortcuts, nothing artificial, poured
                for people who notice the difference.
              </p>
              <div className="cn-pour-line cn-hairline w-full mt-2" />
            </div>
          </div>

          {/* scroll cue */}
          <div
            className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 z-10"
            style={{ opacity: cueOpacity }}
          >
            <span className="cn-mono text-[10px] tracking-[0.3em] text-[#B08D57] uppercase">
              Scroll
            </span>
            <ChevronDown size={16} className="cn-scrollcue text-[#B08D57]" />
          </div>

          {/* the curtain: rises up over the hero as progress → 1, then hands
              off to the actual collection section (same bg, seamless) */}
          <div
            className="cn-curtain"
            style={{
              transform: `translateY(${curtainShift}%)`,
              borderTopLeftRadius: curtainRadius,
              borderTopRightRadius: curtainRadius,
            }}
          >
            <div style={{ opacity: curtainTextOpacity }} className="flex flex-col items-center gap-3 text-center px-6">
              <span className="cn-mono text-[10px] tracking-[0.35em] text-[#B08D57] uppercase">
                Now opening
              </span>
              <h2 className="cn-display italic text-[#EDE6DC] text-4xl sm:text-5xl font-light">
                The Collection
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- COLLECTION SECTION (normal flow, same bg as curtain) ---------------- */}
      <div className="relative z-10">
        <div className="cn-filterbar" data-stuck={stuck}>
          <div className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="cn-display text-2xl text-[#EDE6DC] font-light italic shrink-0">
              The collection
            </h2>
            <div className="w-full sm:w-auto sm:min-w-[280px]">
              <SearchBar />
            </div>
          </div>

          {categories.length > 1 && (
            <div className="max-w-7xl mx-auto px-6 pb-6 flex flex-wrap gap-2.5">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat);
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    data-active={active}
                    className="cn-chip cn-mono flex items-center gap-2 text-xs tracking-wide uppercase px-4 py-2 rounded-full border"
                  >
                    <Icon size={14} />
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-28">
          {error && (
            <p className="text-sm text-[#EDE6DC] bg-[#8B3A2B]/15 border border-[#8B3A2B]/50 px-4 py-3 mb-8 rounded-lg">
              {error}
            </p>
          )}

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && !error && visibleProducts.length === 0 && (
            <div className="text-center py-24 border border-dashed border-[#211A15] rounded-2xl">
              <p className="cn-display text-xl italic text-[#EDE6DC] mb-2">Nothing here yet.</p>
              <p className="text-sm text-[#6E655C]">Check back soon, or try a different category.</p>
            </div>
          )}

          {!loading && !error && visibleProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleProducts.map((p, i) => (
                <ProductCard key={p._id} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}