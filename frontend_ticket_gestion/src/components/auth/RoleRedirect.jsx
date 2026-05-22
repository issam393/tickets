import { Navigate } from "react-router-dom";
import { getAuthUser, getDefaultRouteForRole } from "../../lib/authAccess";

function RoleRedirect() {
  const user = getAuthUser();
  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
}

export default RoleRedirect;
