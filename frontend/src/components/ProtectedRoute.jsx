import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  // Only check role if role prop exists AND is string
  if (role && typeof role === "string") {
    if (storedUser.role?.toLowerCase() !== role.toLowerCase()) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
