const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || "http://localhost:2300/api"
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export const SOCKET_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_ORIGIN
);

export function apiUrl(path) {
  return `${API_BASE_URL}/${String(path || "").replace(/^\/+/, "")}`;
}
