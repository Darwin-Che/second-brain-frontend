import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchAccount } from "../utils/account";
import { logoutAccount } from "../utils/logout";
import { useRouter } from "next/navigation";

interface AuthContextType {
  account: any | null;
  loading: boolean;
  refresh: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setAccount(await fetchAccount());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = load;
  const router =
    typeof window !== "undefined"
      ? require("next/navigation").useRouter()
      : null;
  const logout = async () => {
    await logoutAccount();
    setAccount(null);
    if (router) router.push("/");
  };

  return (
    <AuthContext.Provider value={{ account, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
