// Utility to call backend logout endpoint
export async function logoutAccount(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:4000/api/v1/account/logout", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
