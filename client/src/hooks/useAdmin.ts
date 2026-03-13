import { useState, useCallback } from 'react';

const STORAGE_KEY = 'wt_admin_token';

export function useAdmin() {
  const [token, setTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY);
  });

  const setToken = useCallback((value: string | null) => {
    if (value === null) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, value);
    }
    setTokenState(value);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const isAuthenticated = !!token;

  return { token, setToken, logout, isAuthenticated };
}
