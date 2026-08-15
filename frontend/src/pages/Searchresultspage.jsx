import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../utils/Axiosclient";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 12;

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    axiosClient
      .get("/product/search", { params: { q, page, limit } })
      .then((res) => {
        setProducts(res.data?.message?.hits ?? []);
        setTotal(res.data?.message?.total ?? 0);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Search failed");
      })
      .finally(() => setLoading(false));
  }, [q, page]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
        Results for &quot;{q}&quot;
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        {total} product{total !== 1 ? "s" : ""} found
      </p>

      {loading && <p className="text-sm text-slate-400">Searching...</p>}

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-sm text-slate-400">No products matched your search.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-600/60 transition-colors"
          >
            <div className="aspect-square bg-slate-800">
              {p.image && (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-3">
              <p className="text-sm text-white font-medium truncate">{p.name}</p>
              <p className="text-sm text-orange-400 mt-1">₹{p.finalPrice}</p>
            </div>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setSearchParams({ q, page: p })}
              className={`w-8 h-8 rounded-lg text-sm ${
                p === page
                  ? "bg-orange-600 text-white"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-orange-600/60"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}