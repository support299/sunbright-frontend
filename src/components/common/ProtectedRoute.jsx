import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { normalizeAuthUser } from "../../store/authSlice";

function isDashboardAdmin(user) {
  const u = normalizeAuthUser(user);
  return u?.role === "admin" || Boolean(u?.isStaff);
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  if (!accessToken) return <Navigate to="/auth/login" replace />;
  if (requireAdmin && !isDashboardAdmin(user)) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
