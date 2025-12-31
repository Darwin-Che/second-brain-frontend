// Utility to fetch account info from backend
import { getApiUrl } from "./api";
import { authFetch } from "./authFetch";

export async function fetchAccount(): Promise<any | null> {
  try {
    const url = "/api/v1/account";
    console.debug("fetchAccount: requesting account", { url });
    const res = await authFetch(url);
    console.debug("fetchAccount: response", { status: res.status, ok: res.ok });
    if (res.status === 401) {
      console.info("fetchAccount: unauthorized (401), no logged-in user");
      return null;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "<unable to read body>");
      console.error("fetchAccount: unexpected response", { status: res.status, body: text });
      throw new Error("Failed to fetch account");
    }
    const data = await res.json();
    console.debug("fetchAccount: got account data", { data });
    return data;
  } catch (e) {
    console.error("fetchAccount: error fetching account", e);
    return null;
  }
}
