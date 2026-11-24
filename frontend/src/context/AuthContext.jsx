
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      const response = await api.get("profile/");
      setUser(response.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem("access");

    if (access) {
      getProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await api.post("login/", {
      username,
      password,
    });

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    const profile = await api.get("profile/");
    setUser(profile.data);
  };

  const register = async (data) => {
    return await api.post("register/", data);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await api.patch("profile/", data);
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
