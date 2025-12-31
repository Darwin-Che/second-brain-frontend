// Utility to call backend logout endpoint
import { apiFetch } from "./api";
import { clearAccessToken } from "./authFetch";

export async function logoutAccount(): Promise<boolean> {
  try {
    const url = "/auth/logout";
    console.debug("logoutAccount: calling logout", { url });
  const resText = await apiFetch(url, { method: "POST" });
  // apiFetch throws on non-OK responses, so if we reach here it's OK
  console.debug("logoutAccount: response ok");
    try {
      clearAccessToken();
    } catch (e) {
      console.error("logoutAccount: error clearing token", e);
    }
    return true;
  } catch (e) {
    console.error("logoutAccount: network/error during logout", e);
    return false;
  }
}
