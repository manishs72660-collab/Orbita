import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../component/Authcontext";

// Requires a logged-in user; otherwise sends to /auth
export function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}

// Requires a logged-in Admin; otherwise sends home
export function AdminRoute() {
  const { user } = useAuth();
  return user?.role === "Admin" ? <Outlet /> : <Navigate to="/" replace />;
}