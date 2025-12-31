/**
 * Centralized API configuration for all frontend API calls
 * Use same-origin relative paths so the browser talks to Next.js at the
 * frontend origin, and Next.js proxies requests to the backend using
 * the server-side BACKEND_URL env var.
 */

// All client code should call getApiUrl('/api/whatever') or fetch relative paths
export function getApiUrl(path: string): string {
  // Ensure path starts with a slash
  if (!path.startsWith('/')) path = '/' + path;
  return path;
}

// Optional helper to perform a JSON fetch with sensible defaults
export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = getApiUrl(path);
  const res = await fetch(url, {
    credentials: 'include', // include cookies when using same-origin
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${text}`);
  }

  // Try to parse JSON, otherwise return raw text
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}
