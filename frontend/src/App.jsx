import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./component/Authcontext";
import { CartProvider } from "./component/CartContext";
import { ProtectedRoute, AdminRoute } from "./component/Routeguards";
import Navbar from "./component/Navbar";
import Homepage from "./pages/Homepage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchResultsPage from "./pages/Searchresultspage";
import CartPage from "./pages/CartPage";
import AdminPanel from "./pages/AdminPanel";
import CreateProductPage from "./pages/Createproductpage";
import AuthPage from "./pages/Authpage";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  );
}

// If already logged in (cookie session restored), skip straight past /auth
function AuthRoute() {
  const { user, login } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <AuthPage onAuthSuccess={login} />;
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function AppRoutes() {
  const { checkingAuth } = useAuth();

  // Wait for the GET /auth/me check before deciding where to route,
  // so a logged-in user never flashes the login page.
  if (checkingAuth) return <FullScreenLoader />;

  return (
    <Routes>
      <Route path="/auth" element={<AuthRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/create-product" element={<CreateProductPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}