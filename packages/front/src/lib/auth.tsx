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

export type PermissionModule =
  | "dashboard"
  | "sales"
  | "inventory"
  | "purchases"
  | "accounting"
  | "reports"
  | "planning"
  | "settings";

const adminRoles = new Set(["admin", "sysadmin"]);
const rolePermissions: Record<string, PermissionModule[]> = {
  admin: [
    "dashboard",
    "sales",
    "inventory",
    "purchases",
    "accounting",
    "reports",
    "planning",
    "settings",
  ],
  sysadmin: [
    "dashboard",
    "sales",
    "inventory",
    "purchases",
    "accounting",
    "reports",
    "planning",
    "settings",
  ],
  sales: ["dashboard", "sales"],
  inventory: ["dashboard", "inventory"],
  purchasing: ["dashboard", "purchases"],
  accountant: ["dashboard", "accounting", "reports"],
  planner: ["dashboard", "planning"],
  user: ["dashboard"],
};

export function isAdminRole(role: string | undefined) {
  return !!role && adminRoles.has(role);
}

export function roleCanAccessModule(
  role: string | undefined,
  module: PermissionModule,
) {
  if (!role) return false;
  return rolePermissions[role]?.includes(module) ?? false;
}

export function permissionModuleForPath(path: string): PermissionModule {
  if (path.startsWith("/sales/invoices")) return "accounting";
  if (path.startsWith("/sales")) return "sales";
  if (path.startsWith("/inventory")) return "inventory";
  if (path.startsWith("/purchases/invoices")) return "accounting";
  if (path.startsWith("/purchases")) return "purchases";
  if (path.startsWith("/reports")) return "reports";
  if (path.startsWith("/planning")) return "planning";
  if (path.startsWith("/settings")) return "settings";
  return "dashboard";
}

type CAuthContextValue = {
  user: CAuthUser | null;
  loading: boolean;
  canManageData: boolean;
  canManageUsers: boolean;
  canAccessModule: (module: PermissionModule) => boolean;
  canAccessPath: (path: string) => boolean;
  canWriteModule: (module: PermissionModule) => boolean;
  canWritePath: (path: string) => boolean;
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

  const value = useMemo(() => {
    const canAccessModule = (module: PermissionModule) =>
      roleCanAccessModule(user?.role, module);
    const canAccessPath = (path: string) =>
      canAccessModule(permissionModuleForPath(path));
    const canWriteModule = (module: PermissionModule) =>
      module !== "dashboard" && canAccessModule(module);
    const canWritePath = (path: string) =>
      canWriteModule(permissionModuleForPath(path));

    return {
      user,
      loading,
      canManageData: isAdminRole(user?.role),
      canManageUsers: isAdminRole(user?.role),
      canAccessModule,
      canAccessPath,
      canWriteModule,
      canWritePath,
      login,
      logout,
    };
  }, [loading, login, logout, user]);

  return (
    <CAuthContext.Provider value={value}>{children}</CAuthContext.Provider>
  );
}

export function useCAuth() {
  const context = useContext(CAuthContext);
  if (!context) throw new Error("useCAuth must be used inside CAuthProvider");

  return context;
}
