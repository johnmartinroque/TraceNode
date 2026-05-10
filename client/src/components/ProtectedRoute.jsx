import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, fallback = "/" }) {
  // Check if user is logged in by checking localStorage
  const user = localStorage.getItem("user");
  const session = localStorage.getItem("session");

  // If user and session exist, render the protected component
  if (user && session) {
    return children;
  }

  // If no user logged in, navigate to fallback (landing page or login)
  return <Navigate to={fallback} replace />;
}

export default ProtectedRoute;
