import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../utils/Axiosclient";
import SearchBar from "../component/SearchBar";

export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          All products
        </h1>
        <SearchBar />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {!error && products.length === 0 && (
        <p className="text-sm text-slate-400">No products yet.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-600/60 transition-colors"
          >
            <div className="aspect-square bg-slate-800">
              {p.images?.[0]?.url && (
                <img
                  src={p.images[0].url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-3">
              <p className="text-sm text-white font-medium truncate">{p.name}</p>
              <p className="text-sm text-orange-400 mt-1">₹{p.finalPrice}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}