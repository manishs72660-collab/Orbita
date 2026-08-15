import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/Axiosclient";
import useDebounce from "../utils/Usedebounce";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 250);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    axiosClient
      .get("/product/autocomplete", { params: { q: debouncedQuery } })
      .then((res) => {
        if (cancelled) return;
        setSuggestions(res.data?.message ?? []);
        setOpen(true);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const goToResults = (q) => {
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim()) goToResults(query.trim());
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigate(`/product/${suggestions[activeIndex]._id}`);
        setOpen(false);
      } else {
        goToResults(query.trim());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-600/60 transition-colors"
        />
      </div>

      {open && query.trim() && (
        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg shadow-black/40">
          {loading && <p className="px-3 py-2 text-xs text-slate-500">Searching...</p>}

          {!loading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">No matches found.</p>
          )}

          {!loading &&
            suggestions.map((s, i) => (
              <button
                key={s._id}
                onMouseDown={() => {
                  navigate(`/product/${s._id}`);
                  setOpen(false);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  activeIndex === i ? "bg-slate-800" : "hover:bg-slate-800/60"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                  {s.image && (
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{s.name}</p>
                  <p className="text-xs text-orange-400">₹{s.finalPrice}</p>
                </div>
              </button>
            ))}

          {!loading && (
            <button
              onMouseDown={() => goToResults(query.trim())}
              className="w-full px-3 py-2 text-left text-xs text-orange-400 hover:bg-slate-800/60 border-t border-slate-800"
            >
              See all results for &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}