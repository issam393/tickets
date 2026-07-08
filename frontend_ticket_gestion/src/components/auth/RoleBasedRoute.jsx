import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import AccessDenied from "../ui/AccessDenied/AccessDenied";
import { clearAuthStorage, getAuthUser, normalizeRole } from "../../lib/authAccess";
import { API_BASE_URL } from "../../lib/apiConfig";

const API_BASE = API_BASE_URL;
const INACTIVE_ACCOUNT_MESSAGE = "Your account is inactive. Please contact an administrator.";

function RoleBasedRoute({ allowedRoles, children }) {
  const user = getAuthUser();
  const [access, setAccess] = useState({
    status: user?.token ? "checking" : "signed-out",
    role: user?.role || null,
  });

  useEffect(() => {
    if (!user?.token) {
      setAccess({ status: "signed-out", role: null });
      return undefined;
    }

    let isMounted = true;
    let authorizationToastShown = false;

    const verifyActiveAccount = async (isInitialCheck = false) => {
      try {
        const response = await fetch(`${API_BASE}/employees/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            if (!isMounted) return;
            clearAuthStorage();
            setAccess({ status: "blocked", role: null });
            if (!authorizationToastShown) {
              const message = payload.message === INACTIVE_ACCOUNT_MESSAGE
                ? INACTIVE_ACCOUNT_MESSAGE
                : "Session expired. Please login again.";
              toast.error(message);
              authorizationToastShown = true;
            }
            return;
          }

          if (isInitialCheck && isMounted) {
            setAccess({ status: "error", role: null });
          }
          return;
        }

        if (isMounted) {
          setAccess({
            status: "active",
            role: normalizeRole(payload.data?.service_name || user.role),
          });
        }
      } catch {
        if (isInitialCheck && isMounted) {
          setAccess({ status: "error", role: null });
        }
      }
    };

    verifyActiveAccount(true);
    const intervalId = window.setInterval(() => verifyActiveAccount(false), 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [user?.token, user?.role]);

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (access.status === "blocked" || access.status === "signed-out") {
    return <Navigate to="/login" replace />;
  }

  if (access.status === "checking") {
    return <div className="auth-verification-state" role="status">Verifying account access...</div>;
  }

  if (access.status === "error") {
    return (
      <div className="auth-verification-state auth-verification-error" role="alert">
        Unable to verify your account access. Please refresh or try again later.
      </div>
    );
  }

  if (!allowedRoles.includes(access.role)) {
    return <AccessDenied userRole={access.role} />;
  }

  return children;
}

export default RoleBasedRoute;
