// Utility to fetch account info from backend
import { getApiUrl } from "./api";

export async function fetchAccount(): Promise<any | null> {
  try {
    const res = await fetch(getApiUrl("/api/v1/account"), {
      credentials: "include",
    });
    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to fetch account");
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}
