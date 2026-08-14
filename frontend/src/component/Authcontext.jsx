import { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../utils/Axiosclient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    axiosClient
      .get("/auth/me")
      .then((res) => {
        if (isMounted) setUser(res.data?.message ?? null);
      })
      .catch(() => {
        // no valid session cookie — stay logged out, this is expected
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setCheckingAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // even if the request fails, clear local state
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}