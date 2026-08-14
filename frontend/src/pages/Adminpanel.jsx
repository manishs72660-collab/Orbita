import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8">
      <h1 className="text-2xl font-semibold text-white tracking-tight mb-6">
        Admin panel
      </h1>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <Link
          to="/admin/create-product"
          className="bg-slate-900 border border-slate-800 hover:border-orange-600/60 rounded-2xl p-5 transition-colors"
        >
          <p className="text-white font-medium">Create product</p>
          <p className="text-sm text-slate-400 mt-1">Add a new product to the store</p>
        </Link>
      </div>
    </div>
  );
}