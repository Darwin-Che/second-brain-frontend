// Utility to parse query params from URL
export function getQueryParam(param: string): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}
