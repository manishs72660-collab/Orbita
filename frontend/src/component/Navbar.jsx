import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../component/Authcontext";
import { useCart } from "../component/CartContext";

const STYLES = `
.nb-mono { font-family: 'JetBrains Mono', 'Menlo', monospace; }
.nb-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }

@keyframes nb-pop {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.nb-pop { animation: nb-pop 0.18s cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: top right; }

.nb-avatar-ring {
  background: conic-gradient(from 0deg, #C89B4C, #7A2E1D 40%, #C89B4C 70%, #4A2418 90%, #C89B4C);
  transition: filter 0.3s ease;
}
.nb-trigger:hover .nb-avatar-ring,
.nb-trigger[data-open="true"] .nb-avatar-ring {
  filter: brightness(1.25);
}

.nb-chevron { transition: transform 0.25s ease; }
.nb-trigger[data-open="true"] .nb-chevron { transform: rotate(180deg); }

@media (prefers-reduced-motion: reduce) {
  .nb-pop { animation: none !important; }
}
`;

function initialsFrom(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase() || "?";
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0F0A08]/90 backdrop-blur-md border-b border-[#C89B4C]/15 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
      <style>{STYLES}</style>

      <Link
        to="/"
        className="nb-display text-[#F5EFE6] text-base sm:text-lg font-medium tracking-tight shrink-0"
      >
        Cacao<span className="text-[#C89B4C] italic"> Noir</span>
      </Link>

      <div className="flex items-center gap-1.5 sm:gap-4">
        {user?.role === "Admin" && (
          <Link
            to="/admin"
            className="hidden md:inline-block nb-mono text-[11px] uppercase tracking-wider text-[#9C8B7A] hover:text-[#F5EFE6] transition-colors whitespace-nowrap"
          >
            Admin panel
          </Link>
        )}

        <Link
          to="/cart"
          aria-label="View cart"
          className="relative flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 shrink-0 rounded-lg text-[#9C8B7A] hover:text-[#F5EFE6] hover:bg-[#1C1310] transition-colors"
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
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#C89B4C] text-[#0F0A08] text-[10px] font-semibold leading-none">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>

        {/* profile trigger + popup */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            data-open={open}
            aria-haspopup="menu"
            aria-expanded={open}
            className="nb-trigger flex items-center gap-1 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-full hover:bg-[#1C1310] transition-colors"
          >
            <span className="nb-avatar-ring w-8 h-8 rounded-full p-[2px] flex items-center justify-center shrink-0">
              <span className="w-full h-full rounded-full bg-[#1C1310] flex items-center justify-center">
                <span className="nb-mono text-[11px] text-[#F5EFE6] font-medium">
                  {initialsFrom(user?.username)}
                </span>
              </span>
            </span>
            <svg
              className="nb-chevron w-3.5 h-3.5 text-[#9C8B7A] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              className="nb-pop absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] sm:w-64 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-[#1C1310] border border-[#C89B4C]/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] overflow-x-hidden"
            >
              <div className="px-4 py-4 border-b border-[#2A1F18] flex items-center gap-3">
                <span className="nb-avatar-ring w-10 h-10 rounded-full p-[2px] flex items-center justify-center shrink-0">
                  <span className="w-full h-full rounded-full bg-[#0F0A08] flex items-center justify-center">
                    <span className="nb-mono text-xs text-[#F5EFE6] font-medium">
                      {initialsFrom(user?.username)}
                    </span>
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-[#F5EFE6] font-medium truncate">
                    {user?.username}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-[#9C8B7A] truncate">{user.email}</p>
                  )}
                  {user?.role && (
                    <span className="nb-mono inline-block mt-1 text-[9px] uppercase tracking-wider text-[#C89B4C] border border-[#C89B4C]/40 rounded-full px-2 py-0.5">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1.5">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#E8DFD3] hover:bg-[#241a15] hover:text-[#F5EFE6] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#9C8B7A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My profile
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#E8DFD3] hover:bg-[#241a15] hover:text-[#F5EFE6] transition-colors"
                >
                  <svg className="w-4 h-4 text-[#9C8B7A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
                    <path d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                  </svg>
                  Order history
                </Link>

                {user?.role === "Admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#E8DFD3] hover:bg-[#241a15] hover:text-[#F5EFE6] transition-colors"
                  >
                    <svg className="w-4 h-4 text-[#9C8B7A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2 3 6v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V6l-9-4Z" />
                    </svg>
                    Admin panel
                  </Link>
                )}
              </div>

              <div className="border-t border-[#2A1F18] py-1.5">
                <button
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C98B6E] hover:bg-[#7A2E1D]/15 hover:text-[#F5EFE6] transition-colors text-left"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}