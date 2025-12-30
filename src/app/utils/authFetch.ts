// Centralized fetch wrapper that keeps the access token only in memory
// and attempts to refresh via POST /auth/refresh (refresh token is stored in an httpOnly cookie).
import { getApiUrl } from "./api";

// In-memory access token (not persisted to localStorage)
let inMemoryAccessToken: string | null = null;

// Promise used to serialize refresh requests
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function clearAccessToken() {
  inMemoryAccessToken = null;
}

async function doRefresh(): Promise<string | null> {
  // If a refresh is already in progress, return the same promise
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      console.debug("doRefresh: attempting token refresh");
      const refreshResp = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      console.debug("doRefresh: refresh response", { status: refreshResp.status, ok: refreshResp.ok });
      if (!refreshResp.ok) return null;

      const data = await refreshResp.json().catch(() => null);
      console.debug("doRefresh: refresh body", { data });
      if (data?.access_token) {
        inMemoryAccessToken = data.access_token;
        console.info("doRefresh: obtained new access token");
        return data.access_token;
      }
      console.warn("doRefresh: refresh succeeded but no access_token in body");
      return null;
    } catch (e) {
      console.error("doRefresh: error refreshing token", e);
      return null;
    } finally {
      // clear the refresh promise so subsequent calls can refresh again if needed
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  // Ensure we have an access token in memory. If not, attempt a refresh
  if (!inMemoryAccessToken) {
    console.debug("authFetch: no in-memory token, attempting refresh before request");
    try {
      await doRefresh();
    } catch (e) {
      console.error("authFetch: error during pre-request refresh", e);
    }
  }

  const headers = new Headers(init?.headers as HeadersInit || {});
  if (inMemoryAccessToken) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  // always include credentials so the refresh cookie is sent when needed
  console.debug("authFetch: performing request", { input: String(input), hasAuth: !!inMemoryAccessToken });
  const resp = await fetch(input, { ...init, headers, credentials: "include" as RequestCredentials });

  if (resp.status !== 401) return resp;

  // Attempt to refresh the access token and retry once
  console.info("authFetch: received 401, attempting refresh and retry");
  const newToken = await doRefresh();
  if (!newToken) {
    console.warn("authFetch: refresh failed or returned no token, returning original 401 response");
    return resp;
  }

  headers.set("Authorization", `Bearer ${newToken}`);
  console.debug("authFetch: retrying request with new token", { input: String(input) });
  const retry = await fetch(input, { ...init, headers, credentials: "include" as RequestCredentials });
  console.debug("authFetch: retry response", { status: retry.status, ok: retry.ok });
  return retry;
}

