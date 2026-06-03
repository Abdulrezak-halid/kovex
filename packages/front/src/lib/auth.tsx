import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CAuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  active: boolean;
  createdAt: string;
};

type CAuthContextValue = {
  user: CAuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const CAuthContext = createContext<CAuthContextValue | null>(null);

async function requestAuth(path: string, init?: RequestInit) {
  const response = await fetch(`/api/auth/${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) throw new Error("Authentication request failed");
  if (response.status === 204) return null;

  return (await response.json()) as { user: CAuthUser };
}

export function CAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestAuth("me")
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await requestAuth("login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data?.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await requestAuth("logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [loading, login, logout, user],
  );

  return (
    <CAuthContext.Provider value={value}>{children}</CAuthContext.Provider>
  );
}

export function useCAuth() {
  const context = useContext(CAuthContext);
  if (!context) throw new Error("useCAuth must be used inside CAuthProvider");

  return context;
}
