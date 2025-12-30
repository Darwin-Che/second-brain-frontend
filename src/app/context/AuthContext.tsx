"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchAccount } from "../utils/account";
import { logoutAccount } from "../utils/logout";
import { setAccessToken } from "../utils/authFetch";
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

  const router = useRouter();

  useEffect(() => {
    load();

    // Listen for OAuth postMessage from popup window
    const handler = async (ev: MessageEvent) => {
      // Expect messages like { type: 'oauth', access_token: '...' }
      try {
        console.debug("AuthContext message event received", ev?.data);
        if (!ev.data || typeof ev.data !== "object") return;
        if (ev.data.type === "oauth" && ev.data.access_token) {
          console.debug("AuthContext received access_token via postMessage", {
            has_token: !!ev.data.access_token,
          });
          try {
            setAccessToken(ev.data.access_token);
          } catch (e) {
            console.error("Error setting access token in AuthContext", e);
          }
          // reload account into context and then do an SPA refresh so any login dialog closes
          await load();
          try {
            // Force a full page reload to ensure all components pick up new auth state
            if (typeof window !== "undefined") window.location.reload();
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error("Error handling auth message event", e);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("message", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handler);
      }
    };
  }, [router]);

  const refresh = load;
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
