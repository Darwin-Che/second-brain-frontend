// Utility to call backend logout endpoint
import { getApiUrl } from "./api";
import { clearAccessToken } from "./authFetch";

export async function logoutAccount(): Promise<boolean> {
  try {
    const url = getApiUrl("/auth/logout");
    console.debug("logoutAccount: calling logout", { url });
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
    });
    console.debug("logoutAccount: response", { status: res.status, ok: res.ok });
    try {
      clearAccessToken();
    } catch (e) {
      console.error("logoutAccount: error clearing token", e);
    }
    return res.ok;
  } catch (e) {
    console.error("logoutAccount: network/error during logout", e);
    return false;
  }
}
