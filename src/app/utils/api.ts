/**
 * Centralized API configuration for all frontend API calls
 * Uses NEXT_PUBLIC_API_URL environment variable
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}
