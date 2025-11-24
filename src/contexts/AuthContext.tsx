import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client, getClient, getAuthToken, setAuthToken, setClient, clearAuth as clearAuthStorage, getAuthCookie } from '../services/authService';

interface AuthContextValue {
  client: Client | null;
  token: string | null;
  setAuth: (token: string | null, client?: Client | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClientState] = useState<Client | null>(() => getClient());
  const [token, setTokenState] = useState<string | null>(() => getAuthToken() || getAuthCookie());

  const setAuth = (tok: string | null, cli?: Client | null) => {
    if (tok) setAuthToken(tok); else if (tok === null) clearAuthStorage();
    if (cli) setClient(cli);
    setTokenState(tok);
    setClientState(cli ?? null);
  };

  const clearAuth = () => {
    clearAuthStorage();
    setTokenState(null);
    setClientState(null);
  };

  // ensure sync with storage changes (optional)
  useEffect(() => {
    const onStorage = () => {
      setClientState(getClient());
      setTokenState(getAuthToken());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ client, token, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
