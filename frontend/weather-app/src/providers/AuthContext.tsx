import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  authenticated: boolean;
  email?: string;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true); // État de chargement

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/auth/status", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

      const data = await response.json();
      setAuthenticated(data.authenticated);
      setEmail(data.email);
    } catch {
      setAuthenticated(false);
      setEmail(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, email, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
