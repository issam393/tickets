export const ACCESS_DENIED_MESSAGE = "Access denied. Your role does not have permission to view this section.";

export function normalizeRole(role) {
  if (!role) return null;
  const value = String(role).trim();
  if (value.toUpperCase() === "MANAGER") return "Manager";
  if (value.toUpperCase() === "SERVICE DELIVERY") return "SD";
  if (["SD", "PKI", "IT", "ADMIN"].includes(value.toUpperCase())) return value.toUpperCase();
  return value;
}

export function getAuthUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      id: payload.id || payload.userId,
      username: payload.username || payload.userName,
      role: normalizeRole(payload.service || payload.role),
      token,
    };
  } catch {
    return null;
  }
}

export function getDefaultRouteForRole(role) {
  switch (normalizeRole(role)) {
    case "SD":
      return "/service-delivery/dashboard";
    case "Manager":
      return "/manager/dashboard";
    case "PKI":
      return "/pki/tickets";
    case "IT":
      return "/it/tickets";
    case "ADMIN":
      return "/admin";
    default:
      return "/login";
  }
}

export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
}
