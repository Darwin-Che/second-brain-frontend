// Utility to call backend logout endpoint
import { getApiUrl } from "./api";

export async function logoutAccount(): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl("/api/v1/account/logout"), {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
