import { useState } from "react";
import { AuthContext } from "./AuthContextCore";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const login = async (email, password) => {
    try {
      const res = await fetch("http://192.168.137.232:5000/api/admins/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message };
      }

      // ✅ SAVE TOKEN HERE
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        status: err.status || 500,
        error: err.message || "Login failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token, // ✅ MUST expose this
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
