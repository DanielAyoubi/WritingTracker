import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'wt_pseudonym';

interface UserContextValue {
  pseudonym: string | null;
  setPseudonym: (pseudonym: string | null) => void;
  clearPseudonym: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [pseudonym, setPseudonymState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const setPseudonym = useCallback((value: string | null) => {
    if (value === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, value);
    }
    setPseudonymState(value);
  }, []);

  const clearPseudonym = useCallback(() => {
    setPseudonym(null);
  }, [setPseudonym]);

  return (
    <UserContext.Provider value={{ pseudonym, setPseudonym, clearPseudonym }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
}
