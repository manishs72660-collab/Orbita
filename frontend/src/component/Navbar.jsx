import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../component/Authcontext";
import { useCart } from "../component/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-white font-semibold tracking-tight">
        Store
      </Link>

      <div className="flex items-center gap-5">
        {user?.role === "Admin" && (
          <Link to="/admin" className="text-sm text-slate-300 hover:text-white">
            Admin panel
          </Link>
        )}

        <Link
          to="/cart"
          aria-label="View cart"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-orange-500 text-slate-950 text-[10px] font-semibold leading-none">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>

        <span className="text-sm text-slate-400">
          Signed in as <span className="text-white font-medium">{user?.username}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}