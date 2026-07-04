import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

// Set base URL to the newly deployed backend URL
axios.defaults.baseURL = "https://muhasaba2026.runasp.net";

// Synchronously updated helper to prevent React asynchronous state update race conditions
let currentAccessToken: string | null = null;

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, gender?: number | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Parse payload from a token to extract user details
  const parseTokenPayload = (token: string): User | null => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const parsed = JSON.parse(jsonPayload);
      return {
        name: parsed.name || parsed.username || parsed.email?.split("@")[0] || "مستخدم",
        email: parsed.email || parsed.sub || "",
      };
    } catch (e) {
      return null;
    }
  };

  // Initialize and check for existing refresh token
  useEffect(() => {
    const restoreSession = async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (storedRefreshToken) {
        try {
          const res = await axios.post("/api/auth/refresh", {
            refreshToken: storedRefreshToken,
          });
          const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
          
          currentAccessToken = newAccess;
          setAccessToken(newAccess);
          localStorage.setItem("refreshToken", newRefresh);
          
          const decoded = parseTokenPayload(newAccess);
          setUser(decoded || { name: "مستخدم", email: "" });
        } catch (err) {
          console.error("Failed to silently restore auth session", err);
          localStorage.removeItem("refreshToken");
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // Set up global axios request & response interceptors dynamically with current token state
  useEffect(() => {
    // Request Interceptor: Attach access token
    const reqInterceptor = axios.interceptors.request.use(
      (config) => {
        if (currentAccessToken) {
          config.headers["Authorization"] = `Bearer ${currentAccessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401s and attempt silent renew
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem("refreshToken")
        ) {
          originalRequest._retry = true;
          try {
            const storedRefresh = localStorage.getItem("refreshToken");
            const res = await axios.post("/api/auth/refresh", {
              refreshToken: storedRefresh,
            });
            const { accessToken: newAccess, refreshToken: newRefresh } = res.data;

            currentAccessToken = newAccess;
            setAccessToken(newAccess);
            localStorage.setItem("refreshToken", newRefresh);

            // Re-apply headers and retry the original request
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
            return axios(originalRequest);
          } catch (refreshErr) {
            console.error("Auto-refresh token failed during 401 interception", refreshErr);
            // Logging out the user on failed refresh token rotation
            currentAccessToken = null;
            setAccessToken(null);
            setUser(null);
            localStorage.removeItem("refreshToken");
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { accessToken: access, refreshToken: refresh } = res.data;
    
    currentAccessToken = access;
    setAccessToken(access);
    localStorage.setItem("refreshToken", refresh);
    
    const decoded = parseTokenPayload(access);
    setUser(decoded || {
      email,
      name: email.split("@")[0] || "مستخدم",
    });
  };

  const register = async (name: string, email: string, password: string, gender: number | null = 1) => {
    const res = await axios.post("/api/auth/register", { name, email, password, gender });
    const { accessToken: access, refreshToken: refresh } = res.data;

    currentAccessToken = access;
    setAccessToken(access);
    localStorage.setItem("refreshToken", refresh);

    const decoded = parseTokenPayload(access);
    setUser(decoded || {
      name,
      email,
    });
  };

  const logout = async () => {
    const storedRefresh = localStorage.getItem("refreshToken");
    try {
      if (storedRefresh) {
        await axios.post("/api/auth/logout", { refreshToken: storedRefresh });
      }
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      currentAccessToken = null;
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("refreshToken");
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
