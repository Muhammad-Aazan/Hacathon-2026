import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("hcm_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // App initialization: Verify session via HTTP-Only cookie or token
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        const userData = res.data?.user || res.data?.data;
        if (userData) {
          setUser(userData);
          localStorage.setItem("hcm_user", JSON.stringify(userData));
        }
      })
      .catch((err) => {
        // If 401 or no valid cookie/token
        if (err.response?.status === 401) {
          localStorage.removeItem("hcm_token");
          localStorage.removeItem("hcm_user");
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    if (token) localStorage.setItem("hcm_token", token);
    localStorage.setItem("hcm_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Continue cleanup
    }
    localStorage.removeItem("hcm_token");
    localStorage.removeItem("hcm_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
