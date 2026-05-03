import { createContext, useContext, useMemo, useState } from "react";
import {
  getStoredAuth,
  login as loginRequest,
  register as registerRequest,
  setStoredAuth
} from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const applyAuth = (nextAuth) => {
    setAuth(nextAuth);
    setStoredAuth(nextAuth);
  };

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAdmin: auth?.user?.role === "admin",
      login: async (payload) => {
        const nextAuth = await loginRequest(payload);
        applyAuth(nextAuth);
        return nextAuth;
      },
      register: async (payload) => {
        const nextAuth = await registerRequest(payload);
        applyAuth(nextAuth);
        return nextAuth;
      },
      updateUser: (updatedUser) => {
        const nextAuth = { token: auth?.token, user: updatedUser };
        applyAuth(nextAuth);
      },
      logout: () => applyAuth(null)
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
