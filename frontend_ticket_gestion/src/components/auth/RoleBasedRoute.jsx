import { Navigate } from "react-router-dom";
import AccessDenied from "../ui/AccessDenied/AccessDenied";
import { getAuthUser } from "../../lib/authAccess";

function RoleBasedRoute({ allowedRoles, children }) {
  const user = getAuthUser();

  if (!user?.token || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <AccessDenied userRole={user.role} />;
  }

  return children;
}

export default RoleBasedRoute;
